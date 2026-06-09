import { FILTER_OPTIONS } from './filterData';

function FilterBar({ selectedFilter, onSelectFilter }) {
  return (
    <div className="flex gap-2">
      {FILTER_OPTIONS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onSelectFilter(filter)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedFilter === filter
              ? 'bg-white/15 text-white'
              : 'bg-[#222] text-zinc-600 hover:text-white hover:bg-[#2a2a2a]'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
