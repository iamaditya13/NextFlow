import re

with open("src/sections/FeaturesGrid/index.tsx", "r") as f:
    text = f.read()

# Define the new grid structure
new_grid_class = 'className="box-border caret-transparent gap-x-3.5 gap-y-3.5 grid grid-cols-[repeat(4,1fr)] grid-rows-[repeat(21,minmax(80px,auto))] outline-[oklab(0.556_0_0/_0.5)] md:grid-cols-[repeat(24,1fr)] md:grid-rows-[repeat(17,minmax(50px,auto))]"'

# We'll replace the existing grid class
text = re.sub(r'className="[^"]+grid grid-cols-\[repeat\(4,1fr\)\].*?"', new_grid_class, text)

# Insert the hook at the top
if '"use client";' not in text:
    text = '"use client";\nimport { useScrollReveal } from "@/hooks/useScrollReveal";\n' + text

text = re.sub(
    r'export const FeaturesGrid = \(\) => {',
    'export const FeaturesGrid = () => {\n  const { ref, visible } = useScrollReveal(0.05);\n  const baseAnim = `transition-all duration-700 ease-out transform ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"}`;',
    text
)

text = re.sub(
    r'<section className="',
    r'<section ref={ref} className="',
    text
)

def fix_block(identifier, col_span, row_span, delay_ms):
    global text
    # Find the div that contains this identifier
    # Since the structure is quite flat at the top level of the grid, we can match <div ... > ... identifier ... </div> properly if we're careful.
    pass

# Instead of complex regex for balanced tags, let's use a simpler approach in JS using AST, or just manually rewrite the file using replace!
