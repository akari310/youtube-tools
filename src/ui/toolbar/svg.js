// ===========================================
// SVG icon helpers for toolbar
// ===========================================

export function createSvgIcon(pathsData, size) {
  const sz = size || 24;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', String(sz));
  svg.setAttribute('height', String(sz));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  pathsData.forEach(d => {
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', d);
    if (d === 'M0 0h24v24H0z') p.setAttribute('fill', 'none');
    svg.appendChild(p);
  });
  return svg;
}

export function makeToolBtn(title, id, className, paths) {
  const btn = document.createElement('button');
  btn.title = title;
  btn.type = 'button';
  if (id) btn.id = id;
  btn.className = (className ? className + ' ' : '') + 'botones_div';
  btn.appendChild(createSvgIcon(paths));
  return btn;
}
