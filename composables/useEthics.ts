export default function () {
  const timesVideoHasRendered = useState('times-video-has-rendered', () => 0)

  return {
    timesVideoHasRendered
  }
}
