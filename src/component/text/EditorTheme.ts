import type { EditorThemeClasses } from 'lexical'
import './EditorTheme.scss'

const theme: EditorThemeClasses = {
  heading: {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
  },
  text: {
    bold: 'textBold',
    code: 'textCode',
    italic: 'textItalic',
    strikethrough: 'textStrikethrough',
    subscript: 'textSubscript',
    superscript: 'textSuperscript',
    underline: 'textUnderline',
    underlineStrikethrough: 'textUnderlineStrikethrough',
  },
}

export default theme
