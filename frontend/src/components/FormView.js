import React, { Component } from "react";
import $ from "jquery";

import "../stylesheets/FormView.css";

class FormView extends Component {
  constructor(props) {
    super();
    this.state = {
      question: "",
      answer: "",
      difficulty: 1,
      category: 1,
      categories: [],
    };
  }

  componentDidMount() {
    $.ajax({
      url: `/categories`,
      type: "GET",
      success: (result) => {
        this.setState({ categories: result.currentCates });
        return;
      },
      error: (error) => {
        alert("Unable to load categories. Please try your request again");
        return;
      },
    });
  }

  isCorrectAnswered = (answer) => {
    if (answer) {
      const answerValue = answer
        .replace(/^\s+|\s+$|\s+(?=\s)/g, "")
        .toLowerCase();
      return answerValue;
    }
  };

  submitQuestion = (e) => {
    e.preventDefault();
    $.ajax({
      url: "/question",
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        question: this.state.question,
        answer: this.isCorrectAnswered(this.state.answer),
        difficulty: this.state.difficulty,
        category: parseInt(this.state.category),
      }),
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (result) => {
        document.getElementById("add-question-form").reset();
        return;
      },
      error: (error) => {
        alert("Unable to add question. Please try your request again");
        return;
      },
    });
  };

  onChangeEvent = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <div id="add-question-container">
        <h2>Add a New Trivia Question</h2>
        <form
          className="add-question-form"
          id="add-question-form"
          onSubmit={this.submitQuestion}
        >
          <label>
            Question
            <input type="text" name="question" onChange={this.onChangeEvent} />
          </label>
          <label>
            Answer
            <input type="text" name="answer" onChange={this.onChangeEvent} />
          </label>
          <label>
            Difficulty
            <select name="difficulty" onChange={this.onChangeEvent}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>
          <label>
            Category
            <select name="category" onChange={this.onChangeEvent}>
              {this.state.categories.map((category) => {
                return (
                  <option key={category.id} value={category.id}>
                    {category.type}
                  </option>
                );
              })}
            </select>
          </label>
          <input type="submit" className="btn" value="Submit" />
        </form>
      </div>
    );
  }
}

export default FormView;
