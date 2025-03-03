import React from 'react';
import { Autocomplete, Box, Chip, TextField } from '@mui/material';
import ProviderConfigDialog from './ProviderConfigDialog';

import type { ProviderOptions } from '@/../../../types';

const defaultProviders: ProviderOptions[] = ([] as (ProviderOptions & { id: string })[])
  .concat(
    [
      'replicate:replicate/flan-t5-small:69716ad8c34274043bf4a135b7315c7c569ec931d8f23d6826e249e1c142a264',
    ].map((id) => ({
      id,
      config: { temperature: 0.5, max_length: 1024, repetition_penality: 1.0 },
    })),
  )
  .concat(
    [
      'replicate:replicate/codellama-7b-instruct:0103579e86fc75ba0d65912890fa19ef03c84a68554635319accf2e0ba93d3ae',
      'replicate:replicate/codellama-13b-instruct:da5676342de1a5a335b848383af297f592b816b950a43d251a0a9edd0113604b',
      'replicate:replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf',
    ].map((id) => ({
      id,
      config: {
        system_prompt: '',
        temperature: 0.75,
        top_p: 0.9,
        top_k: 50,
        max_new_tokens: 128,
        min_new_tokens: -1,
      },
    })),
  )
  .concat(
    [
      'replicate:replicate/codellama-7b:6880b103613a9cd23950c5fd6c140197e519905bd0dd00e448c4858bdd06090a',
      'replicate:replicate/codellama-13b-python:09b87c02dfa403e0c3289166dece62286b3bce49bae39a9c9204713cf94b8b7d',
      'replicate:replicate/codellama-13b:1c914d844307b0588599b8393480a3ba917b660c7e9dfae681542b5325f228db',
      'replicate:replicate/codellama-34b-python:9048743d22a7b19cd0abb018066809ea6af4f2b4717bef9aad3c5ae21ceac00d',
      'replicate:replicate/codellama-34b:0666717e5ead8557dff55ee8f11924b5c0309f5f1ca52f64bb8eec405fdb38a7',
    ].map((id) => ({
      id,
      config: {
        temperature: 0.75,
        top_p: 0.9,
        top_k: 50,
        max_new_tokens: 128,
        min_new_tokens: -1,
      },
    })),
  )
  .concat(
    [
      'replicate:a16z-infra/llama-2-7b-chat:7b0bfc9aff140d5b75bacbed23e91fd3c34b01a1e958d32132de6e0a19796e2c',
      'replicate:a16z-infra/llama-2-13b-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52',
    ].map((id) => ({
      id,
      config: {
        temperature: 0.95,
        top_p: 0.95,
        top_k: 250,
        max_new_tokens: 500,
        min_new_tokens: -1,
        repetition_penality: 1.0,
        system_prompt: '',
      },
    })),
  )
  .concat(
    [
      'anthropic:claude-1',
      'anthropic:claude-1-100k',
      'anthropic:claude-instant-1',
      'anthropic:claude-instant-1-100k',
    ].map((id) => ({ id, config: { max_tokens_to_sample: 256, temperature: 0.5 } })),
  )
  .concat(
    [
      'openai:gpt-3.5-turbo',
      'openai:gpt-3.5-turbo-0301',
      'openai:gpt-3.5-turbo-0613',
      'openai:gpt-3.5-turbo-16k',
      'openai:gpt-3.5-turbo-16k-0613',
      'openai:gpt-4',
      'openai:gpt-4-0314',
      'openai:gpt-4-0613',
      'openai:gpt-4-32k',
      'openai:gpt-4-32k-0314',
    ].map((id) => ({
      id,
      config: {
        organization: '',
        apiHost: 'api.openai.com',
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        function_call: undefined,
        functions: undefined,
        stop: undefined,
      },
    })),
  )
  .concat(
    [
      'azureopenai:gpt-3.5-turbo',
      'azureopenai:gpt-3.5-turbo-0301',
      'azureopenai:gpt-3.5-turbo-0613',
      'azureopenai:gpt-3.5-turbo-16k',
      'azureopenai:gpt-3.5-turbo-16k-0613',
      'azureopenai:gpt-4',
      'azureopenai:gpt-4-0314',
      'azureopenai:gpt-4-0613',
      'azureopenai:gpt-4-32k',
      'azureopenai:gpt-4-32k-0314',
    ].map((id) => ({
      id,
      config: {
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        function_call: undefined,
        functions: undefined,
        stop: undefined,
      },
    })),
  )
  .concat(
    [
      'vertex:chat-bison@001',
      'vertex:chat-bison',
      'vertex:chat-bison-32k',
      'vertex:chat-bison-32k@001',
    ].map((id) => ({
      id,
      config: {
        context: undefined,
        examples: undefined,
        temperature: 0,
        maxOutputTokens: 1024,
        topP: 0.95,
        topK: 40,
        safetySettings: undefined,
        stopSequence: undefined,
      },
    })),
  )
  .sort((a, b) => a.id.localeCompare(b.id));

const PREFIX_TO_PROVIDER: Record<string, string> = {
  anthropic: 'Anthropic',
  azureopenai: 'Azure',
  openai: 'OpenAI',
  replicate: 'Replicate',
};

function getGroupName(label?: string) {
  if (!label) {
    return 'Other';
  }
  const name = label.split(':')[0];
  return PREFIX_TO_PROVIDER[name] || name;
}

interface ProviderSelectorProps {
  providers: ProviderOptions[];
  onChange: (providers: ProviderOptions[]) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ providers, onChange }) => {
  const [selectedProvider, setSelectedProvider] = React.useState<ProviderOptions | null>(null);

  const getProviderLabel = (provider: string | ProviderOptions) => {
    if (typeof provider === 'string') {
      return provider;
    }
    return provider.id || 'Unknown provider';
  };

  const getProviderKey = (provider: string | ProviderOptions, index: number) => {
    if (typeof provider === 'string') {
      return provider;
    }
    return provider.id || index;
  };

  const handleProviderClick = (provider: string | ProviderOptions) => {
    if (typeof provider === 'string') {
      alert('Cannot edit custom providers');
    } else if (!provider.config) {
      alert('There is no config for this provider');
    } else {
      setSelectedProvider(provider as ProviderOptions);
    }
  };

  const handleSave = (config: ProviderOptions['config']) => {
    if (selectedProvider) {
      const updatedProviders = providers.map((provider) =>
        provider.id === selectedProvider.id ? { ...provider, config } : provider,
      );
      onChange(updatedProviders);
      setSelectedProvider(null);
    }
  };

  return (
    <Box mt={2}>
      <Autocomplete
        multiple
        freeSolo
        options={defaultProviders}
        value={providers}
        groupBy={(option) => getGroupName(option.id)}
        onChange={(event, newValue: (string | ProviderOptions)[]) => {
          onChange(newValue.map((value) => (typeof value === 'string' ? { id: value } : value)));
        }}
        getOptionLabel={(option) => {
          if (!option) {
            return '';
          }

          let optionString: string = '';
          if (typeof option === 'string') {
            optionString = option;
          }
          if (
            (option as ProviderOptions).id &&
            typeof (option as ProviderOptions).id === 'string'
          ) {
            optionString = (option as ProviderOptions).id!;
          }
          const splits = optionString.split(':');
          if (splits.length > 1) {
            return splits[1];
          }
          return 'Unknown provider';
        }}
        renderTags={(value, getTagProps) =>
          value.map((provider, index: number) => {
            const label = getProviderLabel(provider);
            const key = getProviderKey(provider, index);

            return (
              <Chip
                variant="outlined"
                label={label}
                {...getTagProps({ index })}
                key={key}
                onClick={() => handleProviderClick(provider)}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Select LLM providers"
            helperText={providers.length > 0 ? 'Click a provider to configure its settings.' : null}
          />
        )}
      />
      {selectedProvider && selectedProvider.id && (
        <ProviderConfigDialog
          open={!!selectedProvider}
          providerId={selectedProvider.id}
          config={selectedProvider.config}
          onClose={() => setSelectedProvider(null)}
          onSave={handleSave}
        />
      )}
    </Box>
  );
};

export default ProviderSelector;
