#!/bin/bash
# Find the correct placement for QualityMetrics

# Create backup
cp app/components/SceneGallery.tsx app/components/SceneGallery.tsx.backup

# Use awk to insert QualityMetrics in the correct place
awk '
/{\/\* Metrics \*\// && !found {
    print $0
    print "                      </div>"
    print "                    </div>"
    print "                  )}"
    print ""
    print "                  {/* Professional Quality Metrics */}"
    print "                  <QualityMetrics sceneData={selectedScene} />"
    found = 1
    next
}
{ print }
' app/components/SceneGallery.tsx.backup > app/components/SceneGallery.tsx

echo "Fixed placement of QualityMetrics"
