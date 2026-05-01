import os
import glob

src_dir = os.path.join(os.path.dirname(__file__), '../src')
dist_dir = os.path.join(os.path.dirname(__file__), '../dist')
output_file = os.path.join(dist_dir, 'Youtube_Tools_All_In_One_Optimized.user.js')

if not os.path.exists(dist_dir):
    os.makedirs(dist_dir)

# Get all JS files in src directory, sorted alphabetically
files = sorted(glob.glob(os.path.join(src_dir, '*.js')))

if not files:
    print("No files found in src directory!")
    exit(1)

combined_content = ""
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        combined_content += f.read()

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(combined_content)

print(f"Successfully compiled {len(files)} files into {os.path.basename(output_file)}")
