import subprocess
import os
import sys

def run_command(command, description):
    print(f"--- {description} ---")
    try:
        # Use shell=True for Windows compatibility with git
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error during {description}:")
        print(e.stderr)
        return False

def publish():
    # 1. Bump version
    bump_type = sys.argv[1].lower() if len(sys.argv) > 1 else 'build'
    if not run_command(f"python bump_version.py {bump_type}", "Bumping Version"):
        return

    # 2. Build script
    if not run_command("python build.py", "Building Project"):
        return

    # 3. Git Operations
    if not run_command("git add .", "Git Add"):
        return
    
    # Get the new version from 00_meta.js to use in commit message
    # (Simple way: just use a generic message or read it)
    commit_msg = f"Update to version (auto-build)"
    if not run_command(f'git commit -m "{commit_msg}"', "Git Commit"):
        # Commit might fail if no changes, which is fine
        pass
    
    if not run_command("git push", "Git Push"):
        print("\n!!! PUSH FAILED !!!")
        print("Ensure Git is installed and you are logged in (run 'git push' manually once).")
        return

    print("\n🎉 All steps completed successfully! Your update is live.")

if __name__ == "__main__":
    publish()
