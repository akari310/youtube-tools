import os
import re

input_file = os.path.join(os.path.dirname(__file__), '../Youtube_Tools_All_In_One_Optimized.user.js')
out_dir = os.path.join(os.path.dirname(__file__), '../src')

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's split this automatically combining regex and heuristics
# We know the first chunk is the metadata

idx_init = content.find('(function () {')
if idx_init == -1:
    print("Cannot find (function () {")
    exit(1)

meta_chunk = content[:idx_init]
remaining = content[idx_init:]

with open(os.path.join(out_dir, '00_meta.js'), 'w', encoding='utf-8') as f:
    f.write(meta_chunk)

# Find all blocks separated by // ------------------------------
parts = re.split(r'(// ------------------------------\n)', remaining)

# parts[0] is the content before the first // ------------------------------
with open(os.path.join(out_dir, '01_init_and_globals.js'), 'w', encoding='utf-8') as f:
    f.write(parts[0])

# The rest are in parts[1], parts[2], etc...
# parts[1] is the separator itself, parts[2] is the content, parts[3] is separator, parts[4] is content.
counter = 2
for i in range(1, len(parts) - 1, 2):
    separator = parts[i]
    content_chunk = parts[i+1]
    
    # Generate a name based on the first line of content_chunk
    first_line = content_chunk.strip().split('\n')[0].strip()
    clean_name = re.sub(r'[^a-zA-Z0-9]', '_', first_line).strip('_').lower()
    
    # If the chunk is too small or doesn't have a good comment, just use a generic name
    if not clean_name:
        clean_name = f"section_{counter}"
        
    filename = f"{counter:02d}_{clean_name[:40]}.js"
    
    with open(os.path.join(out_dir, filename), 'w', encoding='utf-8') as f:
        f.write(separator + content_chunk)
        
    print(f"Saved {filename}")
    counter += 1

print("Splitting complete based on block separators!")
