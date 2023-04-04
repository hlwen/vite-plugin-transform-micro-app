/*
 * SystemJS format Babel transformer
 */
import { ConfigEnv, Plugin } from 'vite';
// import { Worker } from 'worker_threads';
import {transform} from '@babel/core';
import babelPluginTransformModulesSystemJS from '@babel/plugin-transform-modules-systemjs';
import babelPluginProposalDynamicImport from '@babel/plugin-proposal-dynamic-import';

export function transformToSystemjs(config: ConfigEnv) {
   const { mode } = config
  return {
    name: 'vite-plugin-transform-js',
    enforce: 'post',
    async transform(source: string, importer: string) {
      const result = await new Promise((resolve, reject) => {
        transform(
          source,
          {
            filename: importer,
            sourceMaps: true,
            ast: false,
            compact: false,
            sourceType: 'module',
            parserOpts: {
              errorRecovery: true
            },
            plugins: [babelPluginProposalDynamicImport, babelPluginTransformModulesSystemJS]
          },
          function (err: any, result: { code: any; map: any; }) {
            if (err) return reject(err);
            resolve({ code: result.code, map: result.map })
          }
        );
        // const worker = new Worker(__dirname + '/transform.worker.mjs', {
        //   workerData: {
        //     source,
        //     url: importer,
        //     sourcemap: true,//'inline'
        //   }
        // });
        // worker.once("message", (result) => {
        //   result && resolve(result);
        //   worker.terminate();
        // });
      })
      return result
    },

  }
}
export function transformToMicroApp(config: ConfigEnv): Plugin {
  const { mode } = config

  return {
    name: 'vite-plugin-transform-micro-app',
    enforce: 'post',
    transformIndexHtml(code: string) {
      if (mode === 'development') {
        const list: string[] = code.match(/<script\s*type="module"(.*?)<\/script>/g) || []
        let s = ''
        list.forEach(i => {
          code = code.replace(i, '')
          i.replace(/src\=['"](.*?)['"]/g, (a, b) => {
            // if (s) {
            //   s += `.then(()=>System.import('${b}'))\n`
            // } else {
              s += `await System.import('${b}');\n`
            // }

            return a
          })
        })
        s = `<script>async function run(){\n${s}};run();</script>\n</body>`
        // 可选
        code = code.replace('</head>', '<script src="js/s.min.js"></script>\n</head>')
        code = code.replace('</body>', s)
        return code;
      }
       console.log(code)
      if (mode === 'production') {
          // const list = code.match(/<script\s*type="module"(.*?)<\/script>/g)
          // let s = ''
          // list.forEach(i => {
          //   code = code.replace(i, '')
          //   i.replace(/src\=['"](.*?)['"]/g, (a, b) => {
          //     s += `System.import('${b}');\n`
          //     return a
          //   })
          // })
          // s = `<script>\n
          //           ${s}
          //             </script>\n
          //             </body>
          //           `
          // 可选
        
           
          code = code.replace(/<script\s*type="module"(.*?)<\/script>/g, '')
          code = code.replace(/<link\s*rel="modulepreload"(.*?)>/g, '')
          code = code.replace(/<script\s*nomodule/g, '<script')
          code = code.replace('</head>', '<script src="js/s.min.js"></script>\n</head>')
          // code = code.replace('</body>', s)
          return code;
      }


      return code;
    },


    //   server = _server
    //   // 返回一个在内部中间件安装后
    //   // 被调用的后置钩子
    //   return () => {
    //     server.middlewares.use((req, res, next) => {
    //       console.log(req.url)


    //       next()
    //       // 自定义请求处理...
    //     })
    //   }
    // },
    // transformIndexHtml(code, b, c) {
    //   const list = code.match(/<script\s*type="module"(.*?)<\/script>/g)
    //   let s = ''
    //   list.forEach(i => {
    //     code = code.replace(i, '')
    //     i.replace(/src\=['"](.*?)['"]/g, (a, b) => {
    //       s += `System.import('${b}');`
    //       return a
    //     })
    //   })
    //   s = `
    //            <script>
    //           ${s}
    //             </script>
    //             </body>
    //           `
    //   // 可选
    //   code = code.replace('</head>', '<script src="s.js"></script ></head>')
    //   code = code.replace('</body>', s)
    //   return code;
    // },
    // resolveId(code, ide) {
    //   console.log(code, ide)
    // },
    // enforce: 'post',
    transform(source: string) {
      if (mode === 'development') {
        const code = source.replace(/import\s*?(['"].*?(.scss|.css|.less)['"])/g,
          (a, b) => {
            return `import(${b})`
          });
        return {
          code
        }
      }

    },
    configResolved(config: any) {
      if (mode === 'development') {
        config.plugins.push(transformToSystemjs(config))
      }
      // if (mode === 'production') {
      //   config.plugins.push({
      //     name: 't1',
      //     enforce: 'post',
      //     apply: 'build',
      //     async renderChunk(raw, chunk, opts) {

      //       console.log(chunk)
      //       const code = await new Promise((resolve, reject) => {
      //         const worker = new Worker('./transform.worker.mjs', {
      //           workerData: {
      //             source: raw,
      //             url: chunk.fileName
      //           }
      //         });
      //         worker.once("message", code => {
      //           code && resolve(code);
      //           worker.terminate();
      //         });
      //       })
      //       return { code }
      //     },
      //   })
      // }
    }
  }
}

