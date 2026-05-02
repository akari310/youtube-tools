import glob
import os


def build():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    src_dir = os.path.join(repo_root, 'src')
    output_file = os.path.join(repo_root, 'youtube-tools.user.js')

    files = sorted(glob.glob(os.path.join(src_dir, '*.js')))
    if not files:
        raise FileNotFoundError(f'No source files found in {src_dir}')

    combined_content = ''
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as src_file:
            combined_content += src_file.read()

    with open(output_file, 'w', encoding='utf-8', newline='') as out_file:
        out_file.write(combined_content)

    print(f'Built {output_file} from {len(files)} source files.')


if __name__ == '__main__':
    build()
