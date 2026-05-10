import argparse
import os
import re
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(__file__)
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import build
import bump_version


def run_git(args, repo_root, check=True):
    return subprocess.run(
        ['git'] + args,
        cwd=repo_root,
        check=check,
        text=True,
        capture_output=True,
    )


def read_version(repo_root):
    candidates =[
        os.path.join(repo_root, 'youtube-tools.user.js'),
        os.path.join(repo_root, 'src', '00_core', '00_meta.js'),
    ]
    for file_path in candidates:
        if not os.path.exists(file_path):
            continue
        with open(file_path, 'r', encoding='utf-8') as script_file:
            match = re.search(r'@version\s+([\d.]+)', script_file.read())
        if match:
            return match.group(1)
    return 'unknown'


def has_staged_changes(repo_root):
    result = run_git(['diff', '--cached', '--quiet'], repo_root, check=False)
    return result.returncode == 1


# Đổi mặc định push=True
def commit(message=None, push=True, bump=True, bump_type='build'):
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

    if bump:
        bump_version.bump_version(bump_type)
        build.build()

    version = read_version(repo_root)
    commit_message = message or f'Update v{version}'

    run_git(['add', '.'], repo_root)
    if not has_staged_changes(repo_root):
        print('No staged changes to commit.')
        return

    run_git(['commit', '-m', commit_message], repo_root)
    print(f'Committed: {commit_message}')

    if push:
        run_git(['push'], repo_root)
        print('Pushed current branch to GitHub.')


def main():
    parser = argparse.ArgumentParser(description='Stage, commit and push repository changes.')
    parser.add_argument('-m', '--message', help='Commit message. Defaults to Update v<version>.')
    parser.add_argument(
        '--bump-type',
        choices=['build', 'patch', 'minor', 'major'],
        default='build',
        help='Version bump type to run before commit. Defaults to build.',
    )
    parser.add_argument('--no-bump', action='store_true', help='Commit without bumping version or rebuilding.')
    
    # Sửa --push thành --no-push
    parser.add_argument('--no-push', action='store_true', help='Do NOT push to GitHub after committing (Push is default now).')
    
    args = parser.parse_args()

    try:
        commit(
            message=args.message,
            push=not args.no_push,  # Đảo ngược logic: Nếu không có cờ --no-push thì push=True
            bump=not args.no_bump,
            bump_type=args.bump_type,
        )
    except subprocess.CalledProcessError as err:
        if err.stdout:
            sys.stdout.write(err.stdout)
        if err.stderr:
            sys.stderr.write(err.stderr)
        raise SystemExit(err.returncode)


if __name__ == '__main__':
    main()