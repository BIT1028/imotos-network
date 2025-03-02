import { JetBrains_Mono, Orbitron, Noto_Sans_JP, Space_Grotesk } from 'next/font/google'

// 科技感编程字体
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains'
})

// 未来科技感显示字体
export const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron'
})

// 日文字体
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-jp'
})

// 现代无衬线字体
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk'
})

// 字体变量CSS类名
export const fontVariables = [
  jetbrainsMono.variable,
  orbitron.variable,
  notoSansJP.variable,
  spaceGrotesk.variable
].join(' ')