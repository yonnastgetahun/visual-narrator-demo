#!/bin/bash
# Find the exact line after metrics section
LINE_NUM=$(grep -n "Complete solution" app/components/SceneGallery.tsx | tail -1 | cut -d: -f1)
if [ -n "$LINE_NUM" ]; then
    # Insert after the line that closes the metrics section
    sed -i '' "${LINE_NUM}a\\
                    </div>\\
                  </div>\\
                )}\\
                {/* Professional Quality Metrics */}\\
                <QualityMetrics sceneData={selectedScene} />" app/components/SceneGallery.tsx
    echo "Fixed placement at line $((LINE_NUM + 1))"
else
    echo "Could not find metrics section"
fi
