import cliProgress from 'cli-progress'
import pc from 'picocolors'

// 条形在前，阶段名在最后，这样每条进度条的左边界都对齐。
const FORMAT = '{bar} {percentage}% {value}/{total} {phase} 用时 {duration_formatted}'
const BAR_OPTIONS = {
  format: FORMAT,
  barsize: 24,
  barCompleteChar: '█',
  barIncompleteChar: '░',
  // 光标隐藏期间必须保证 stop() 被调用，否则终端会丢掉光标。
  hideCursor: true,
}

export function createProgress(stream = process.stdout) {
  let bar = null
  let phase = null

  const finish = () => {
    // 非 TTY 流下 cli-progress 的 start()/stop() 都是空操作，这里无需额外判断。
    bar?.stop()
    bar = null
    phase = null
  }

  return {
    // update(label, current, total)：label 变化即开启新阶段，current 到 total 即结束该阶段并换行。
    update: (label, current = 0, total = 0) => {
      if (total <= 0) return
      if (phase !== label) {
        finish()
        phase = label
        bar = new cliProgress.SingleBar({ ...BAR_OPTIONS, stream })
        bar.start(total, 0, { phase: pc.cyan(label) })
      }
      bar.update(Math.min(current, total))
      if (current >= total) finish()
    },
    done: (message) => {
      finish()
      stream.write(`${pc.green('✔')} ${message}\n`)
    },
    fail: (message) => {
      finish()
      stream.write(`${pc.red('✖')} ${message}\n`)
    },
  }
}
