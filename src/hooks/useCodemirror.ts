import { useState, useEffect } from 'react';
import type { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { Compartment } from '@codemirror/state';
import type { LanguageSupport } from '@codemirror/language';

type Bundle = typeof import('../codemirror');

interface Theme {
  base: Extension;
  highlight: Extension;
}

interface Editor {
  view: EditorView;
  codemirror: Bundle;
  setTheme: (theme: Theme) => void;
  loadExentions: (options: { filename: string; theme: Theme }) => Promise<Extension>;
}

const loadExentions = async ({
  filename,
  codemirror,
  theme,
  themeCompartment,
  highlightCompartment,
}: {
  filename: string;
  theme: Theme;
  codemirror: Bundle;
  themeCompartment: Compartment;
  highlightCompartment: Compartment;
}): Promise<Extension> => {
  const languageDescription = filename
    ? codemirror.language.LanguageDescription.matchFilename(
        codemirror.languageData.languages,
        filename,
      )
    : null;

  let languageSupport: null | LanguageSupport = null;

  if (languageDescription?.name === 'Markdown') {
    const md = await import('@codemirror/lang-markdown');
    languageSupport = md.markdown({
      codeLanguages: codemirror.languageData.languages.filter((d) => d.name !== 'Markdown'),
    });
  } else if (languageDescription) {
    languageSupport = await languageDescription.load();
  }

  const extensions = [
    codemirror.gutter.lineNumbers(),
    codemirror.view.highlightSpecialChars(),
    codemirror.fold.foldGutter(),
    codemirror.history.history(),
    codemirror.view.drawSelection(),
    codemirror.state.EditorState.allowMultipleSelections.of(true),
    codemirror.language.indentOnInput(),
    codemirror.matchbrackets.bracketMatching(),
    codemirror.closebrackets.closeBrackets(),
    codemirror.autocomplete.autocompletion(),
    codemirror.rectangularSelection.rectangularSelection(),
    codemirror.view.highlightActiveLine(),
    codemirror.search.highlightSelectionMatches(),
    ...(languageSupport ? [languageSupport] : []),
    themeCompartment.of(theme.base),
    highlightCompartment.of(theme.highlight),
    codemirror.view.keymap.of([
      ...codemirror.commands.defaultKeymap,
      ...codemirror.closebrackets.closeBracketsKeymap,
      ...codemirror.search.searchKeymap,
      ...codemirror.history.historyKeymap,
      ...codemirror.fold.foldKeymap,
      ...codemirror.comment.commentKeymap,
      ...codemirror.autocomplete.completionKeymap,
      ...codemirror.lint.lintKeymap,
    ]),
  ];

  return extensions;
};

const useCodemirror = (): [null | Editor, (div: null | HTMLDivElement) => void] => {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (!el) {
      return;
    }

    let didCancel = false;

    let view: null | EditorView;

    const createEditor = async () => {
      const themeCompartment = new Compartment();
      const highlightCompartment = new Compartment();
      const codemirror = await import('../codemirror');

      if (!el || didCancel) {
        return;
      }

      view = new codemirror.view.EditorView({
        parent: el,
      });

      setEditor({
        view,
        codemirror,
        setTheme: (theme: Theme) => {
          console.log(theme);

          view?.dispatch({
            effects: [
              themeCompartment.reconfigure(theme.base),
              highlightCompartment.reconfigure(theme.highlight),
            ],
          });
        },
        loadExentions: (options: { filename: string; theme: Theme }) =>
          loadExentions({
            codemirror,
            filename: options.filename,
            theme: options.theme,
            themeCompartment,
            highlightCompartment,
          }),
      });
    };

    createEditor();

    return () => {
      didCancel = true;

      if (view) {
        view.destroy();
        view = null;
      }
    };
  }, [el]);

  return [editor, setEl];
};

export const getTheme = (codemirror: Bundle, kind: 'light' | 'dark'): Theme => {
  if (kind === 'dark') {
    return {
      base: codemirror.themeOneDark.oneDarkTheme,
      highlight: codemirror.themeOneDark.oneDarkHighlightStyle,
    };
  }

  return {
    base: codemirror.view.EditorView.theme({
      '&': {
        backgroundColor: 'white',
      },
    }),
    highlight: codemirror.highlight.defaultHighlightStyle,
  };
};

export default useCodemirror;
