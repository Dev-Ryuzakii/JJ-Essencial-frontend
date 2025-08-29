#!/bin/bash

# Fix TypeScript issues in the frontend
echo "Fixing TypeScript import issues..."

# Files to fix type imports in
FILES=(
  "src/components/admin/Settings.new.tsx"
  "src/components/admin/Settings.old.tsx" 
  "src/components/admin/ReviewManagement.tsx"
  "src/components/admin/Products.tsx"
  "src/pages/admin/AdminDashboard.tsx"
)

# Fix type-only imports
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix AdminSettingsDto, BankAccountDto, etc imports
    sed -i '' 's/import {.*AdminSettingsDto.*/import type { AdminSettingsDto } from "..\/..\/services\/adminApi"/g' "$file"
    sed -i '' 's/import {.*BankAccountDto.*/import type { BankAccountDto } from "..\/..\/services\/adminApi"/g' "$file"
    sed -i '' 's/import {.*CreateBankAccountDto.*/import type { CreateBankAccountDto } from "..\/..\/services\/adminApi"/g' "$file"
    sed -i '' 's/import {.*UpdateBankAccountDto.*/import type { UpdateBankAccountDto } from "..\/..\/services\/adminApi"/g' "$file"
    
    # Fix Product and ProductFilter imports  
    sed -i '' 's/import {.*Product.*ProductFilter.*/import type { Product, ProductFilter } from "..\/..\/services\/productsApi"/g' "$file"
    
    # Fix AdminReviewDto imports
    sed -i '' 's/import {.*AdminReviewDto.*/import type { AdminReviewDto } from "..\/..\/services\/adminApi"/g' "$file"
    
    echo "Fixed imports in $file"
  fi
done

echo "Type import fixes completed!"
