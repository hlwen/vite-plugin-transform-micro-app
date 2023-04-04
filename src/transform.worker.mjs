import { parentPort, workerData } from 'worker_threads';
import * as babel from '@babel/core';
import babelPluginTransformModulesSystemJS from '@babel/plugin-transform-modules-systemjs';
import babelPluginProposalDynamicImport from '@babel/plugin-proposal-dynamic-import';

const { source, url, sourcemap } = workerData;

babel.transform(
  source,
  {
    filename: url,
    sourceMaps: sourcemap,
    ast: false,
    compact: false,
    sourceType: 'module',
    parserOpts: {
      errorRecovery: true
    },
    plugins: [babelPluginProposalDynamicImport, babelPluginTransformModulesSystemJS]
  },
  function (err, result) {
    if (err) return reject(err);
    // const code = result.code + '\n//# sourceURL=' + url + '!system';
    // 发送消息
    parentPort.postMessage({ code: result.code, map: result.map });
    parentPort.close(); // 关闭自身
  }
);
