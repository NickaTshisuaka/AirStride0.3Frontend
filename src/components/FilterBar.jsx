import React from "react";
import { Filter, X } from "lucide-react";
import "./FilterBar.css";

const FilterBar = ({
  categories = [],
  selectedCategories = [],
  onCategoryChange,
  onClearAll,
}) => {
  const handleCheckboxChange = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((c) => c !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <aside className="product-filter-bar">
      <div className="filter-header">
        <div className="filter-title-wrapper">
          <Filter size={18} />
          <h3>Filters</h3>
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="applied-filters-section">
          <div className="applied-header">
            <span>Applied Filters</span>
            <button className="clear-all-btn" onClick={onClearAll}>
              clear all
            </button>
          </div>
          <div className="applied-tags">
            {selectedCategories.map((cat) => (
              <span key={cat} className="filter-tag">
                {cat}
                <X
                  size={14}
                  onClick={() => handleCheckboxChange(cat)}
                  style={{ cursor: "pointer", marginLeft: "4px" }}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="filter-group">
        <div className="filter-group-header">
          <span>Category ID</span>
        </div>
        <div className="filter-options">
          {categories.map((category) => (
            <label key={category} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCheckboxChange(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterBar;