import React, { useEffect, useRef, useState } from 'react';
import type { EditorState } from '@codemirror/state';

import useCodemirror, { getTheme } from './hooks/useCodemirror';
import { languages } from './languages';

const Editor = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState(() => languages[languages.length - 1]);
  const fileStateMapRef = useRef<Record<string, EditorState>>({});
  const themeRef = useRef(theme);

  const [editor, editorRef] = useCodemirror();

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setTheme(getTheme(editor.codemirror, theme));
  }, [editor, theme]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const state = fileStateMapRef.current[language.filename];

    const currentTheme = getTheme(editor.codemirror, themeRef.current);

    if (state) {
      // We've loaded this file before

      editor.view.setState(state);

      // TODO: only do this if the state's theme doesn't match the current one
      editor.setTheme(currentTheme);

      return;
    }

    // Create the editor state object for this file

    let didCancel = false;

    editor
      .loadExentions({ filename: language.filename, theme: currentTheme })
      .then((extensions) => {
        if (didCancel) {
          return;
        }

        const { codemirror } = editor;

        // Keep our state in sync with the editor's state. This listener is called
        // after view.setState and on any future updates
        const updateListener = codemirror.view.EditorView.updateListener.of((update) => {
          fileStateMapRef.current[language.filename] = update.state;
        });

        const currentState = codemirror.state.EditorState.create({
          doc: language.text,
          extensions: [extensions, updateListener],
        });

        editor.view.setState(currentState);
      });

    return () => {
      didCancel = true;
    };
  }, [editor, language]);

  return (
    <div>
      <header>
        <select
          value={language.name}
          onChange={(e) => {
            const next = languages.find((l) => l.name === e.currentTarget.value);
            if (next) {
              setLanguage(next);
            }
          }}
        >
          {languages.map((l) => (
            <option key={l.name} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        <label>
          Dark
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={(e) => setTheme(e.currentTarget.checked ? 'dark' : 'light')}
          />
        </label>
      </header>
      <div className="codemirror-container" ref={editorRef} />
    </div>
  );
};

export default Editor;
