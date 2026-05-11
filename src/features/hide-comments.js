// Toggle comment section visibility

export function hideComments(enabled) {
  const comments = document.querySelector('#comments');
  if (comments) {
    comments.style.display = enabled ? 'none' : '';
  }
}
