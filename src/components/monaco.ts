import type { Environment } from 'monaco-editor';
import { editor as Editor, languages, Uri } from 'monaco-editor';

import TS_WORKER from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker';
import EDITOR_WORKER from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';

// Since packaging is done by you, you need
// to instruct the editor how you named the
// bundles that contain the web workers.
(globalThis as any).MonacoEnvironment = {
  getWorker: function (_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new TS_WORKER();
    }

    return (() => {
      const EditorWorker = new EDITOR_WORKER();
      EditorWorker?.terminate?.();
      return EditorWorker;
    })();
  },
} as Environment;

export const outputModelResetValue = '// Output';
export const inputModelResetValue = [
  '// Click Build for the bundled, minified and compressed package size',
  'export * from "@okikio/animate";',
].join('\n');

export function build(inputEl: HTMLDivElement) {
  const initialValue = inputModelResetValue;
  const initialConfig = `{}`;

  inputEl.textContent = '';

  // Basically monaco on android is pretty bad, this makes it less bad
  // See https://github.com/microsoft/pxt/pull/7099 for this, and the long
  // read is in https://github.com/microsoft/monaco-editor/issues/563
  const isAndroid = navigator && /android/i.test(navigator.userAgent);

  const inputModel = Editor.createModel(
    initialValue,
    'typescript',
    Uri.parse('file://input.tsx')
  );
  const outputModel = Editor.createModel(
    outputModelResetValue,
    'typescript',
    Uri.parse('file://output.tsx')
  );
  const configModel = Editor.createModel(
    initialConfig,
    'json',
    Uri.parse('file://config.json')
  );

  inputModel.updateOptions({ tabSize: 2 });
  outputModel.updateOptions({ tabSize: 2 });
  configModel.updateOptions({ tabSize: 2 });

  const editorOpts: Editor.IStandaloneEditorConstructionOptions = {
    model: null,
    // @ts-ignore
    bracketPairColorization: {
      enabled: true,
    },
    parameterHints: {
      enabled: true,
    },
    quickSuggestions: {
      other: !isAndroid,
      comments: !isAndroid,
      strings: !isAndroid,
    },
    acceptSuggestionOnCommitCharacter: !isAndroid,
    acceptSuggestionOnEnter: !isAndroid ? 'on' : 'off',
    minimap: {
      enabled: false,
    },
    padding: {
      bottom: 2.5,
      top: 2.5,
    },
    scrollbar: {
      // Subtle shadows to the left & top. Defaults to true.
      useShadows: false,
      vertical: 'auto',
    },
    lightbulb: { enabled: true },
    wordWrap: 'on',
    roundedSelection: true,
    scrollBeyondLastLine: true,
    smoothScrolling: true,
    automaticLayout: true,
    language: 'typescript',
    lineNumbers: 'on',
  };

  const editor = Editor.create(inputEl, editorOpts);
  editor.setModel(inputModel);

  languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    ...languages.typescript.typescriptDefaults.getDiagnosticsOptions(),

    noSemanticValidation: true,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,

    // This is when tslib is not found
    diagnosticCodesToIgnore: [2354],
  });

  // Compiler options
  languages.typescript.typescriptDefaults.setCompilerOptions({
    moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
    target: languages.typescript.ScriptTarget.Latest,
    module: languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    lib: ['es2021', 'dom', 'dom.iterable', 'webworker', 'esnext', 'node'],
    exclude: ['node_modules'],
    resolveJsonModule: true,
    allowNonTsExtensions: true,
    esModuleInterop: true,
    noResolve: true,
    allowSyntheticDefaultImports: true,
    isolatedModules: true,

    experimentalDecorators: true,
    emitDecoratorMetadata: true,

    jsx: languages.typescript.JsxEmit.ReactJSX,
  });

  return [editor, inputModel, outputModel, configModel] as const;
}

export { languages, Editor, Uri };
