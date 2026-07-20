import MarkdownIt from 'markdown-it'

// Mentions are stored inline in the comment body as @[Display Name](userId),
// e.g. "thanks @[Jane Doe](2f6a...) can you take a look?"
const MENTION_RE = /^@\[([^\]]+)\]\(([\w-]+)\)/

function mentionPlugin(md: MarkdownIt) {
  md.inline.ruler.before('link', 'mention', (state, silent) => {
    const match = MENTION_RE.exec(state.src.slice(state.pos))
    if (!match) return false

    if (!silent) {
      const token = state.push('mention', '', 0)
      token.meta = { label: match[1], userId: match[2] }
    }

    state.pos += match[0].length
    return true
  })

  md.renderer.rules.mention = (tokens, idx) => {
    const { label, userId } = tokens[idx].meta
    return `<span class="note-comment-mention" data-user-id="${md.utils.escapeHtml(userId)}">@${md.utils.escapeHtml(label)}</span>`
  }
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: false,
}).use(mentionPlugin)

export function mentionToken(label: string, userId: string): string {
  return `@[${label}](${userId})`
}

export function renderCommentBody(body: string): string {
  return md.render(body || '')
}
