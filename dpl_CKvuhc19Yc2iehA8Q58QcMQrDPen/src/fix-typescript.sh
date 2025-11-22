#!/bin/bash
echo "🔧 Fixing common TypeScript issues..."

# Fix useRef issues
find app/components -name "*.tsx" -exec sed -i '' 's/useRef<NodeJS\.Timeout>()/useRef<NodeJS.Timeout | null>(null)/g' {} \;

# Fix event handler types
find app/components -name "*.tsx" -exec sed -i '' 's/const handleEnded = () => {/const handleEnded = (): void => {/g' {} \;

echo "✅ TypeScript fixes applied!"
