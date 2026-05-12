// Reverse page layout (flex-direction: row-reverse)

export function reverseMode(enabled) {
  if (enabled) {
    document.documentElement.style.setProperty('flex-direction', 'row-reverse', 'important');
    const primary = document.querySelector('#primary');
    const secondary = document.querySelector('#secondary');
    if (primary && secondary) {
      primary.style.order = '2';
      secondary.style.order = '1';
    }
  } else {
    document.documentElement.style.removeProperty('flex-direction');
    const primary = document.querySelector('#primary');
    const secondary = document.querySelector('#secondary');
    if (primary) primary.style.order = '';
    if (secondary) secondary.style.order = '';
  }
}
