'use client';

import * as React from 'react';
import invariant from 'tiny-invariant';
import CircularProgress from '@mui/material/CircularProgress';
import { io as SocketIOClient } from 'socket.io-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import ResultsView from './ResultsView';
import { API_BASE_URL, IS_RUNNING_LOCALLY } from '@/constants';
import { useStore } from './store';

import type { EvaluateSummary, UnifiedConfig, SharedResults } from '@/../../../types';
import type { Database } from '@/types/supabase';
import type { EvalTable } from './types';

import './Eval.css';

async function fetchEvalsFromSupabase(): Promise<{ id: string; createdAt: string }[]> {
  const supabase = createClientComponentClient<Database>();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  invariant(user, 'User not logged in');
  const { data, error } = await supabase
    .from('EvaluationResult')
    .select('id, createdAt')
    .eq('user_id', user.id)
    .order('createdAt', { ascending: false })
    .limit(100);
  return data || [];
}

async function fetchEvalFromSupabase(
  id: string,
): Promise<Database['public']['Tables']['EvaluationResult']['Row'] | null> {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase.from('EvaluationResult').select('*').eq('id', id).single();
  return data;
}

interface EvalOptions {
  fetchId?: string;
  preloadedData?: SharedResults;
  recentEvals?: { id: string; label: string }[];
  defaultEvalId?: string;
}

export default function Eval({
  fetchId,
  preloadedData,
  recentEvals: recentEvalsProp,
  defaultEvalId: defaultEvalIdProp,
}: EvalOptions) {
  const router = useRouter();
  const { table, setTable, setConfig } = useStore();
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [failed, setFailed] = React.useState<boolean>(false);
  const [recentEvals, setRecentEvals] = React.useState<{ id: string; label: string }[]>(
    recentEvalsProp || [],
  );

  const fetchRecentFileEvals = async () => {
    invariant(IS_RUNNING_LOCALLY, 'Cannot fetch recent files when not running locally');
    const resp = await fetch(`${API_BASE_URL}/results`, { cache: 'no-store' });
    const body = await resp.json();
    setRecentEvals(body.data);
    return body.data;
  };

  const fetchEvalById = async (id: string) => {
    const resp = await fetch(`${API_BASE_URL}/results/${id}`, { cache: 'no-store' });
    const body = await resp.json();
    setTable(body.data.results.table);
    setConfig(body.data.config);
  };

  const handleRecentEvalSelection = async (id: string) => {
    if (IS_RUNNING_LOCALLY) {
      fetchEvalById(id);
      // TODO(ian): This requires next.js standalone server
      // router.push(`/eval/local:${encodeURIComponent(file)}`);
    } else {
      setLoaded(false);
      router.push(`/eval/remote:${encodeURIComponent(id)}`);
    }
  };

  const [defaultEvalId, setDefaultEvalId] = React.useState<string>(
    defaultEvalIdProp || recentEvals[0]?.id,
  );

  const searchParams = useSearchParams();
  const file = searchParams ? searchParams.get('file') : null;

  React.useEffect(() => {
    if (file) {
      const doIt = async () => {
        await fetchEvalById(file);
        setLoaded(true);
      };
      doIt();
    } else if (preloadedData) {
      setTable(preloadedData.data.results?.table as EvalTable);
      setConfig(preloadedData.data.config);
      setLoaded(true);
    } else if (fetchId) {
      const doIt = async () => {
        const response = await fetch(`https://api.promptfoo.dev/eval/${fetchId}`);
        if (!response.ok) {
          setFailed(true);
          return;
        }
        const results = await response.json();
        setTable(results.data.results?.table as EvalTable);
        setConfig(results.data.config);
        setLoaded(true);
      };
      doIt();
    } else if (IS_RUNNING_LOCALLY) {
      const socket = SocketIOClient(API_BASE_URL);

      socket.on('init', (data) => {
        console.log('Initialized socket connection', data);
        setLoaded(true);
        setTable(data.results.table);
        setConfig(data.config);
        fetchRecentFileEvals().then((newRecentEvals) => {
          setDefaultEvalId(newRecentEvals[0]?.id);
        });
      });

      socket.on('update', (data) => {
        console.log('Received data update', data);
        setTable(data.results.table);
        setConfig(data.config);
        fetchRecentFileEvals().then((newRecentEvals) => {
          setDefaultEvalId(newRecentEvals[0]?.id);
        });
      });

      return () => {
        socket.disconnect();
      };
    } else {
      // TODO(ian): Move this to server
      fetchEvalsFromSupabase().then((records) => {
        setRecentEvals(
          records.map((r) => ({
            id: r.id,
            label: r.createdAt,
          })),
        );
        if (records.length > 0) {
          fetchEvalFromSupabase(records[0].id).then((evalRun) => {
            invariant(evalRun, 'Eval not found');
            const results = evalRun.results as unknown as EvaluateSummary;
            const config = evalRun.config as unknown as Partial<UnifiedConfig>;
            setDefaultEvalId(records[0].id);
            setTable(results.table);
            setConfig(config);
            setLoaded(true);
          });
        }
      });
    }
  }, [fetchId, setTable, setConfig, preloadedData, setDefaultEvalId, file]);

  if (failed) {
    return <div className="loading">404 Eval not found</div>;
  }

  if (!loaded || !table) {
    return (
      <div className="loading">
        <div>
          <CircularProgress size={22} />
        </div>
        <div>Loading eval data</div>
      </div>
    );
  }

  return (
    <ResultsView
      defaultEvalId={defaultEvalId}
      recentEvals={recentEvals}
      onRecentEvalSelected={handleRecentEvalSelection}
    />
  );
}
