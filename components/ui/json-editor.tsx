'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import { EditorView, keymap } from '@codemirror/view'
import { useTheme } from 'next-themes'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  height?: string
  onValidate?: (isValid: boolean, errors: string[]) => void
  isValid?: boolean
  stats?: { categories: number; items: number; size: number }
}

export function JsonEditor({
  value,
  onChange,
  disabled = false,
  height = '500px',
  onValidate,
  isValid = true,
  stats
}: JsonEditorProps) {
  const { theme } = useTheme()
  const [view, setView] = useState<EditorView | null>(null)

  // Custom keymaps
  const customKeymap = keymap.of([
    {
      key: 'Mod-s',
      run: () => {
        const event = new CustomEvent('monaco-save')
        window.dispatchEvent(event)
        return true
      }
    },
    {
      key: 'Mod-r',
      run: () => {
        const event = new CustomEvent('monaco-refresh')
        window.dispatchEvent(event)
        return true
      }
    },
    {
      key: 'Mod-d',
      run: () => {
        const event = new CustomEvent('monaco-download')
        window.dispatchEvent(event)
        return true
      }
    },
    {
      key: 'Alt-Shift-f',
      run: () => {
        formatJson()
        return true
      }
    }
  ])

  // Validation logic
  const validate = useCallback((val: string) => {
    if (onValidate) {
      try {
        JSON.parse(val)
        onValidate(true, [])
      } catch (error) {
        onValidate(false, [(error as Error).message])
      }
    }
  }, [onValidate])

  const handleChange = useCallback((val: string) => {
    onChange(val)
    validate(val)
  }, [onChange, validate])

  // Format JSON function
  const formatJson = useCallback(() => {
    try {
      const currentVal = value
      const parsed = JSON.parse(currentVal)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
    } catch (e) {
      // Ignore format error if invalid JSON
      console.warn('Cannot format invalid JSON')
    }
  }, [value, onChange])

  // Listen for format event
  useEffect(() => {
    const handleFormat = () => formatJson()
    window.addEventListener('monaco-format', handleFormat)
    return () => window.removeEventListener('monaco-format', handleFormat)
  }, [formatJson])

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">navigation.json</span>
          {value && (
            <span className="text-xs text-muted-foreground">
              {value.split('\n').length} 行 · {value.length} 字符
            </span>
          )}
          {/* JSON Status */}
          <div className="flex items-center gap-1">
            {isValid ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">格式正确</span>
                {stats && (
                  <span className="text-xs text-muted-foreground ml-1">
                    · {stats.categories} 分类 · {stats.items} 站点
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">格式错误</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl+S</kbd>
            <span>保存</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Alt+Shift+F</kbd>
            <span>格式化</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl+F</kbd>
            <span>查找</span>
          </div>
        </div>
      </div>

      {/* CodeMirror Editor */}
      <CodeMirror
        value={value}
        height={height}
        theme={theme === 'dark' ? githubDark : githubLight}
        extensions={[json(), customKeymap, EditorView.lineWrapping]}
        onChange={handleChange}
        onCreateEditor={(view) => setView(view)}
        editable={!disabled}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: true,
          tabSize: 2,
        }}
        className="text-sm"
      />
    </div>
  )
}