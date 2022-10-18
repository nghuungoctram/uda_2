import React, { Component } from "react";

import "../stylesheets/App.css";
import Question from "./Question";
import Search from "./Search";
import $ from "jquery";

class QuestionView extends Component {
  constructor() {
    super();
    this.state = {
      questions: [],
      page: 1,
      totalQuestions: 0,
      categories: [],
      currentCategory: null,
    };
  }

  componentDidMount() {
    this.getQuestions();
  }

  getQuestions = () => {
    $.ajax({
      url: `/questions?page=${this.state.page}`,
      type: "GET",
      success: (result) => {
        this.setState({
          questions: result.dataResult.questions,
          categories: result.dataResult.categories,
          totalQuestions: result.total,
          currentCategory: result.dataResult.category,
        });
        console.log(this.state)
        return;
      },
      error: (error) => {
        alert("Unable to load questions. Please try your request again");
        return;
      },
    });
  };

  selectPage(num) {
    this.setState({ page: num }, () => this.getQuestions());
  }

  createPagination() {
    let pageNumbers = [];
    let maxPage = Math.ceil(this.state.totalQuestions / 10);
    for (let i = 1; i <= maxPage; i++) {
      pageNumbers.push(
        <span
          key={i}
          className={`page-num ${i === this.state.page ? "active" : ""}`}
          onClick={() => {
            this.selectPage(i);
          }}
        >
          {i}
        </span>
      );
    }
    return pageNumbers;
  }

  getByCategory = (id) => {
    $.ajax({
      url: `/category/${id}/questions`,
      type: "GET",
      success: (result) => {
        this.setState({
          questions: result.questions,
          totalQuestions: result.total,
          currentCategory: result.category,
        });
        return;
      },
      error: (error) => {
        alert("Unable to load questions. Please try your request again");
        return;
      },
    });
  };

  submitSearch = (searchTerm) => {
    $.ajax({
      url: `/question`,
      type: "POST",
      dataType: "json",
      data: JSON.stringify({ searchTerm: searchTerm }),
      contentType: "application/json",
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (result) => {
        this.setState({
          questions: result.questions,
          totalQuestions: result.total
        });
        return;
      },
      error: (error) => {
        alert("Unable to load questions. Please try your request again");
        return;
      },
    });
  };

  questionAction = (id) => (action) => {
    if (action === "DELETE") {
      if (window.confirm("are you sure you want to delete the question?")) {
        $.ajax({
          url: `/question/${id}`,
          type: "DELETE",
          success: (result) => {
            this.getQuestions();
          },
          error: (error) => {
            alert("Unable to load questions. Please try your request again");
            return;
          },
        });
      }
    }
  };

  render() {
    return (
      <div className="question-view">
        <div className="categories-list">
          <h2
            onClick={() => {
              this.getQuestions();
            }}
          >
            Categories
          </h2>
          <ul>
            {this.state?.categories?.map((category) => (
              <li
                key={category.id}
                onClick={() => {
                  this.getByCategory(category.id);
                }}
              >
                {category.type}
                <img className="category" src={`${category.type}.svg`} />
              </li>
            ))}
          </ul>
          <Search submitSearch={this.submitSearch} />
        </div>
        <div className="questions-list">
          <h2>Questions</h2>
          {this.state.questions.map((q) => (
            <Question
              key={q.id}
              question={q.question}
              answer={q.answer}
              category={this.state.categories[q.category - 1].type}
              difficulty={q.difficulty}
              questionAction={this.questionAction(q.id)}
            />
          ))}
          <div className="pagination-menu">{this.createPagination()}</div>
        </div>
      </div>
    );
  }
}

export default QuestionView;
