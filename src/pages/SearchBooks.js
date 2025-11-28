import { useState } from "react";
import BookCard from "../components/BookCard.js";
import axios from "axios";
import "./SearchBooks.css";

const SearchBooks = ({ user, setUser }) => {
  const [search, setSearch] = useState("");
  const [bookData, setBookData] = useState([]);

  const searchBook = (evt) => {
    if (evt.key === "Enter") {
      axios
        .get(
          "https://www.googleapis.com/books/v1/volumes?q=" +
            search +
            "&key=" + process.env.REACT_APP_GOOGLE_BOOKS_API_KEY +
            "&maxResults=40" +
            "&printType=books" +
            "&orderBy=relevance" +
            "&langRestrict=en"
        )
        .then((res) => {
          // Filter out non-book items (calendars, journals, etc.)
          const filteredBooks = (res.data.items || []).filter((item) => {
            const title = item.volumeInfo.title?.toLowerCase() || "";
            const categories = item.volumeInfo.categories || [];

            // Exclude calendars, journals, workbooks, and other non-books
            const excludeKeywords = ['calendar', 'journal', 'diary', 'workbook', 'notebook', 'planner'];
            const hasExcludedKeyword = excludeKeywords.some(keyword => title.includes(keyword));

            // Exclude if categories suggest it's not a regular book
            const excludedCategories = ['Calendars', 'Journals', 'Diaries'];
            const hasExcludedCategory = categories.some(cat =>
              excludedCategories.some(excluded => cat.includes(excluded))
            );

            return !hasExcludedKeyword && !hasExcludedCategory;
          });

          setBookData(filteredBooks);
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <div className="search-books-page">
      <div className="header">
        <div className="row2">
          <h2>Find Your Book</h2>
          <div className="search">
            <input
              type="text"
              placeholder="Enter Your Book Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={searchBook}
            />
          </div>
        </div>
      </div>
      {search !== "" && bookData !== undefined && bookData.length > 0 && (
        <div className="gridcontainer">
          <BookCard books={bookData} setUser={setUser} user={user} />
        </div>
      )}
    </div>
  );
};

export default SearchBooks;
