import re
import os
import sys

def bump_version(type='auto'):
    meta_path = '../src/00_meta.js'
    files_to_sync = [
        '../src/17_const_ytmambientmode.js',
        '../src/15_function_parsecounttext_text.js'
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
    
    # Ensure 4 parts
    while len(parts) < 4:
        parts.append(0)

    # Specific Logic: Base-10 Rollover
    # Format: Major.Minor.Patch.Build (X.Y.Z.W)
    
    if type == 'auto' or type == 'build':
        parts[3] += 1
        # Rollover check
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
            # ... and so on
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

    # Update files
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
