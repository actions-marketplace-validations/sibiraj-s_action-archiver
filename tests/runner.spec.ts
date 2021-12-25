import fs from 'node:fs';
import path from 'node:path';
import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import * as core from '@actions/core';

import run from '../src/runner';
import tempy from './utils/tempy';

const mockStartGroup = jest.spyOn(core, 'startGroup');
const mockEndGroup = jest.spyOn(core, 'endGroup');
const mockSetOutput = jest.spyOn(core, 'setOutput');

describe('Runner', () => {
  beforeEach(() => {
    process.env['INPUT_WORKING-DIRECTORY'] = '.tmp';
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await fs.promises.rm(tempy.root, { force: true, recursive: true });
  });

  it('should create archive correctly', async () => {
    process.env.INPUT_FORMAT = 'tar';
    process.env.INPUT_PATH = '*';
    process.env.INPUT_OUTPUT = 'runner.zip';
    process.env.INPUT_GZIP = 'false';

    await run();
    const outfile = path.join(process.cwd(), '.tmp/runner.zip');
    expect(fs.existsSync(outfile)).toBe(true);

    expect(mockStartGroup).toHaveBeenCalled();

    expect(mockStartGroup).toHaveBeenCalledWith('Archiver');
    expect(mockEndGroup).toHaveBeenCalled();

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toHaveBeenCalledWith('archive', outfile);
  });

  it('should create a zip archive', async () => {
    process.env.INPUT_FORMAT = 'zip';
    process.env.INPUT_PATH = '*';
    process.env.INPUT_OUTPUT = 'runner_a.zip';

    await run();
    const outfile = path.join(process.cwd(), '.tmp/runner_a.zip');
    expect(fs.existsSync(outfile)).toBe(true);
  });

  it('should throw error for unknown format', () => {
    process.env.INPUT_FORMAT = 'xar';
    expect(run()).rejects.toThrow('Format \'xar\' is not registered.');
  });
});
