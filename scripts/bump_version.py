import re
import os
import sys

def bump_version(type='auto'):
    # Use absolute paths based on the script location
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    meta_path = os.path.join(base_dir, 'src/00_core/00_meta.js')
    files_to_sync = [
        os.path.join(base_dir, 'src/02_ui/12b_ytm_ambient.js'),
        os.path.join(base_dir, 'src/01_utils/08_parse_count.js')
    ]

    if not os.path.exists(meta_path):
        print(f"Error: {meta_path} not found")
        return

    with open(meta_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.search(r'@version\s+([\d\.]+)', content)
    if not match:
        print("Could not find version in 00_meta.js")
        return

    old_version = match.group(1)
    parts = [int(p) for p in old_version.split('.')]
    
    while len(parts) < 4:
        parts.append(0)

    if type == 'auto' or type == 'build':
        parts[3] += 1
        if parts[3] >= 10:
            parts[3] = 0
            parts[2] += 1
            if parts[2] >= 10:
                parts[2] = 0
                parts[1] += 1
                if parts[1] >= 10:
                    parts[1] = 0
                    parts[0] += 1
    elif type == 'patch':
        parts[2] += 1
        parts[3] = 0
        if parts[2] >= 10:
            parts[2] = 0
            parts[1] += 1
    elif type == 'minor':
        parts[1] += 1
        parts[2] = 0
        parts[3] = 0
    elif type == 'major':
        parts[0] += 1
        parts[1] = 0
        parts[2] = 0
        parts[3] = 0

    new_version = '.'.join(map(str, parts))
    print(f"Bumping version ({type}): {old_version} -> {new_version}")

    new_content = re.sub(r'(@version\s+)[\d\.]+', rf'\g<1>{new_version}', content)
    with open(meta_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    for file_path in files_to_sync:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                f_content = f.read()
            updated_f_content = f_content.replace(old_version, new_version)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_f_content)
            print(f"Updated {file_path}")

if __name__ == "__main__":
    bump_type = sys.argv[1].lower() if len(sys.argv) > 1 else 'auto'
    bump_version(bump_type)
