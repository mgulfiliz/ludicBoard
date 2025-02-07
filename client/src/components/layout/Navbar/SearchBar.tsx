import React, { useState, useRef, useCallback, useEffect } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchQuery } from "@/lib/api/api";
import { debounce } from "lodash";
import { SearchResults } from "@/types";

interface SearchBarProps {
  isDarkMode?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isDarkMode = false }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const { 
    data: searchResults, 
    isLoading, 
    isError 
  } = useSearchQuery(searchTerm.trim(), {
    skip: searchTerm.trim().length < 2,
  });

  const handleSearch = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      setSelectedResultIndex(-1);
    }, 300),
    []
  );

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedResultIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      searchInputRef.current.focus();
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm.length >= 2) {
      router.push(`/search?query=${encodeURIComponent(trimmedSearchTerm)}`);
    }
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!searchResults) return;

    const totalResults: any[] = [
      ...(searchResults.tasks || []),
      ...(searchResults.projects || []),
      ...(searchResults.users || [])
    ];

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedResultIndex((prevIndex) => 
          Math.min(prevIndex + 1, totalResults.length - 1)
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedResultIndex((prevIndex) => 
          Math.max(prevIndex - 1, -1)
        );
        break;
      case 'Enter':
        if (selectedResultIndex >= 0 && totalResults[selectedResultIndex]) {
          const result = totalResults[selectedResultIndex];
          const type = result.taskId ? 'tasks' : 
                       result.projectId ? 'projects' : 
                       result.userId ? 'users' : null;
          const id = result.taskId || result.projectId || result.userId;
          if (type && id) {
            router.push(`/${type}/${id}`);
          }
        }
        break;
    }
  }, [searchResults, selectedResultIndex, router]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && event.target !== searchInputRef.current) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Searching...
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-4 text-center text-sm text-red-500 dark:text-red-400">
          Error searching. Please try again.
        </div>
      );
    }

    if (!searchResults || (!searchResults.tasks?.length && 
        !searchResults.projects?.length && 
        !searchResults.users?.length)) {
      return (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No results found
        </div>
      );
    }

    const resultSections: { 
      title: string; 
      data: any[]; 
      type: keyof SearchResults; 
      renderItem: (item: any) => React.ReactNode 
    }[] = [
      {
        title: 'Tasks',
        data: searchResults.tasks || [],
        type: 'tasks',
        renderItem: (task) => task.title
      },
      {
        title: 'Projects',
        data: searchResults.projects || [],
        type: 'projects',
        renderItem: (project) => project.name
      },
      {
        title: 'Users',
        data: searchResults.users || [],
        type: 'users',
        renderItem: (user) => user.username
      }
    ];

    return (
      <div 
        ref={searchResultsRef} 
        className="absolute top-full z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
      >
        {resultSections.map((section, sectionIndex) => 
          section.data.length > 0 ? (
            <div key={section.title} className="p-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {section.title}
              </p>
              {section.data.slice(0, 5).map((item, index) => {
                const globalIndex = resultSections
                  .slice(0, sectionIndex)
                  .reduce((acc, curr) => acc + Math.min(curr.data.length, 5), 0) + index;
                
                return (
                  <div 
                    key={item.id} 
                    className={`cursor-pointer p-2 ${
                      globalIndex === selectedResultIndex 
                        ? 'bg-gray-200 dark:bg-gray-600' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => router.push(`/${section.type}/${item.id}`)}
                  >
                    <p className="text-sm dark:text-white">
                      {section.renderItem(item)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null
        )}
        <div 
          className="cursor-pointer p-2 text-center text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => router.push(`/search?query=${encodeURIComponent(searchTerm)}`)}
        >
          View all results
        </div>
      </div>
    );
  };

  return (
    <form 
      onSubmit={handleSearchSubmit} 
      className="relative flex h-min w-[300px]"
    >
      <SearchIcon className="absolute left-[8px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-gray-500 dark:text-white" />
      <input
        ref={searchInputRef}
        className="w-full rounded-lg border border-gray-300 bg-white p-2 pl-10 pr-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        type="search"
        placeholder="Search tasks, projects, and users (Press '/')"
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        aria-label="Search"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 transform"
          aria-label="Clear search"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-white" />
        </button>
      )}
      {searchTerm.trim().length >= 2 && renderSearchResults()}
    </form>
  );
};
