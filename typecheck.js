const ts = require('./node_modules/typescript');
const configPath = ts.findConfigFile('./', ts.sys.fileExists);
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, './');
parsed.options.noEmit = true;
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = ts.getPreEmitDiagnostics(program);
diagnostics.forEach(d => {
  const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
  if (d.file) {
    const pos = d.file.getLineAndCharacterOfPosition(d.start);
    console.log(d.file.fileName + ':' + (pos.line + 1) + ' - ' + msg);
  } else {
    console.log(msg);
  }
});
if (diagnostics.length === 0) console.log('No type errors');
else console.log('\n' + diagnostics.length + ' error(s)');
