import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, IntlProvider, ThemeProvider } from 'smarthr-ui'
import 'smarthr-ui/smarthr-ui.css'
import 'leaflet/dist/leaflet.css'
import { App } from './App'
import './styles.css'

// ブランドカラー（ベリー系）。smarthr-uiのMAINカラーを上書きする
const theme = createTheme({ color: { MAIN: '#9d3a67' } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <IntlProvider locale="ja">
        <App />
      </IntlProvider>
    </ThemeProvider>
  </StrictMode>,
)
