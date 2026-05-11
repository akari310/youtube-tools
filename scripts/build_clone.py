import os
import glob

def build():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    src_dir = os.path.join(repo_root, 'src_clone')
    output_file = os.path.join(repo_root, 'youtube-tools-clone.user.js')

    # Define the order of directories to ensure dependency resolution
    # We follow the 00, 01, 02 numbering for folders
    subdirs = sorted([d for d in os.listdir(src_dir) if os.path.isdir(os.path.join(src_dir, d))])
    
    combined_content = ''
    total_files = 0

    # If there are no subdirs, fallback to flat file build in src/
    if not subdirs:
        files = sorted(glob.glob(os.path.join(src_dir, '*.js')))
        for file_path in files:
            with open(file_path, 'r', encoding='utf-8') as src_file:
                combined_content += src_file.read() + '\n'
            total_files += 1
    else:
        for subdir in subdirs:
            subdir_path = os.path.join(src_dir, subdir)
            # Sort files within each subdir numerically/alphabetically
            files = sorted(glob.glob(os.path.join(subdir_path, '*.js')))
            for file_path in files:
                with open(file_path, 'r', encoding='utf-8') as src_file:
                    combined_content += src_file.read() + '\n'
                total_files += 1

    with open(output_file, 'w', encoding='utf-8', newline='') as out_file:
        out_file.write(combined_content)

    print(f'Successfully built {output_file} from {total_files} files in {len(subdirs) if subdirs else "flat"} structure.')

if __name__ == '__main__':
    build()
