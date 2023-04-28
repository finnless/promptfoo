#!/usr/bin/env node
import { Command } from 'commander';
import { EvaluationOptions } from './types';
import { loadApiProvider } from './apiCaller';
import { evaluate } from './evaluator';

const program = new Command();

program
  .command('eval')
  .description('Evaluate prompts')
  .requiredOption('-p, --prompts <paths...>', 'Paths to prompt files')
  .requiredOption('-o, --output <path>', 'Path to output CSV file')
  .requiredOption('-r, --provider <name or path>', 'One of: openai:chat, openai:completion, openai:<model name>, or path to custom API caller module')
  .option('-v, --vars <path>', 'Path to CSV file with prompt variables')
  .action(async (cmdObj: EvaluationOptions & Command) => {
    const options: EvaluationOptions = {
      prompts: cmdObj.prompts,
      output: cmdObj.output,
      provider: cmdObj.provider,
      vars: cmdObj.vars,
    };

    const provider = loadApiProvider(options.provider);
    const results = await evaluate(options, provider);
    console.log('Evaluation complete:');
    console.log(results);
    console.log('Done.');
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}