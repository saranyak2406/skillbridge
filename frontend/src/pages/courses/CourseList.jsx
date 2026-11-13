import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  BookOpen, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || '');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch categories
  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.data.categories || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Fetch courses with active filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
    if (sortBy) params.append('sort', sortBy);
    if (priceFilter === 'free') {
      params.append('max_price', '0');
    } else if (priceFilter === 'paid') {
      params.append('min_price', '0.01');
    }

    api.get(`/courses?${params.toString()}`)
      .then((res) => {
        setCourses(res.data.data.courses || []);
      })
      .catch((err) => {
        console.error('Failed to load courses:', err);
      })
      .finally(() => setLoading(false));
  }, [search, selectedCategory, selectedDifficulty, priceFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search, category: selectedCategory });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setPriceFilter('all');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Search Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-card">
        <div className="max-w-2xl">
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400">
            Course Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
            Explore Industry-Ready Courses
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Learn from verified instructors, complete interactive quizzes, submit capstone assignments, and earn verified credentials.
          </p>
        </div>

        {/* Search input in banner */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl">
          <div className="relative flex items-center bg-white rounded-2xl shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition">
            <Search className="h-5 w-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, topic, or keyword..."
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-wrap items-center justify-between gap-4">
        
        {/* Categories Horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.category_name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedCategory === cat.category_name
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Price */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Enrolled</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {(selectedCategory || selectedDifficulty || priceFilter !== 'all' || search) && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-medium">Fetching courses from database...</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden hover:shadow-hover transition duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
                      {course.category_name || 'General'}
                    </span>
                  </div>
                  <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[11px] font-semibold">
                    {course.duration || '10 hours'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Rating & Students */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{Number(course.average_rating || 5.0).toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({course.reviews_count || 0})</span>
                    </div>
                    <span className="text-slate-500 font-medium">
                      {course.total_enrolled || 0} students
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition">
                    <Link to={`/courses/${course.id}`}>{course.title}</Link>
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {course.instructor_name ? course.instructor_name.charAt(0) : 'I'}
                    </div>
                    <span className="truncate">{course.instructor_name}</span>
                    <span className="ml-auto px-2 py-0.5 rounded bg-slate-100 font-semibold capitalize text-[10px]">
                      {course.difficulty_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price and Action Footer */}
              <div className="p-6 pt-0 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-slate-900">
                    {parseFloat(course.price) === 0 ? 'Free' : `$${parseFloat(course.price).toFixed(2)}`}
                  </span>
                </div>
                <Link
                  to={`/courses/${course.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-4">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Courses Found</h3>
          <p className="text-xs text-slate-500">
            No courses matched your current filter criteria. Try adjusting your search query or reset your filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};

export default CourseList;
