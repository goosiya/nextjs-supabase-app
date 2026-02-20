/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // 이모지로 시작하는 커밋 메시지 허용 (예: ✨ feat: 새 기능 추가)
      headerPattern:
        /^(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\s?)?(\w*)(?:\((\w*)\))?!?:\s(.*)$/u,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  rules: {
    // 타입 목록
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'build',
        'ci',
      ],
    ],
    // 제목 최대 길이
    'header-max-length': [2, 'always', 100],
    // 제목 끝에 마침표 금지
    'subject-full-stop': [2, 'never', '.'],
    // 빈 body 허용
    'body-leading-blank': [1, 'always'],
    // 한국어/대문자 고유명사 허용 (OAuth, API 등)
    'subject-case': [0],
  },
}

export default config
