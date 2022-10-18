import React, { Component } from "react";
import $ from "jquery";

import "../stylesheets/QuizView.css";

let questionLimit = 5;

class QuizView extends Component {
  constructor(props) {
    super();
    this.state = {
      quizCate: null,
      categories: {},
      previousQuestions: [],
      currentQuestion: {},
      isAnswer: false,
      isGameEnded: false,
      countCorrectAnswer: 0,
      countTotalQuestionByCate: 0,
      guess: ""
    };
  }

  componentDidMount() {
    $.ajax({
      url: `/categories`,
      type: "GET",
      success: (res) => {
        this.setState({
          categories: res.currentCates.map((category) => category.type),
        });
        return;
      },
      error: (error) => {
        alert("Unable to load categories. Please try your request again");
        return;
      },
    });
  }

  cateSelected = ({ type, id = 0 }) => {
    this.setState({ quizCate: { type, id } }, this.getNextQuestion);
  };

  onChangeEvent = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getNextQuestion = () => {
    const previousQuestions = [...this.state.previousQuestions];
    console.log(this.state)
    if (this.state.currentQuestion.id) {
      previousQuestions.push(this.state.currentQuestion.id);
    }

    $.ajax({
      url: "/quiz/question",
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        previous_questions: previousQuestions,
        category: parseInt(this.state.quizCate.id),
      }),
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (res) => {
        this.setState({
          isAnswer: false,
          previousQuestions: previousQuestions,
          currentQuestion: res.question,
          guess: "",
          isGameEnded: res.question ? false : true,
        });
        return;
      },
      error: () => {
        this.setState({
          isGameEnded: true
        });
        alert("Unable to load question or question is not added yet");
        return;
      },
    });
  };

  submitGuess = (e) => {
    e.preventDefault();
    const answerValue = this.state.guess
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .toLowerCase();
    let evaluate = this.isCorrectAnswered();
    this.setState({
      countCorrectAnswer: !evaluate ? this.state.countCorrectAnswer : this.state.countCorrectAnswer + 1,
      isAnswer: true,
    });
  };

  restartGame = () => {
    this.setState({
      quizCate: null,
      previousQuestions: [],
      isAnswer: false,
      countCorrectAnswer: 0,
      currentQuestion: {},
      guess: "",
      isGameEnded: false,
    });
  };

  renderPrePlay() {
    return (
      <div className="quiz-play-container">
        <div className="cate-selection">Please select Category below</div>
        <div className="category-wrapper">
          <div className="quiz-play-cate" onClick={this.cateSelected}>
            ALL
          </div>
          {Object.keys(this.state.categories).map((id) => {
            return (
              <div
                key={id}
                value={id}
                className="quiz-play-cate"
                onClick={() =>
                  this.cateSelected({ type: this.state.categories[id], id })
                }
              >
                {this.state.categories[id]}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderFinalScore() {
    return (
      <div className="quiz-play-container">
        <div className="final-header">
          {" "}
          Your Final Score is {this.state.countCorrectAnswer}
        </div>
        <div className="play-again btn" onClick={this.restartGame}>
          {" "}
          Play Again?{" "}
        </div>
      </div>
    );
  }

  isCorrectAnswered = () => {
    if (this.state.guess && this.state.currentQuestion.answer) {
      const answerValue = this.state.guess
        .replace(/^\s+|\s+$|\s+(?=\s)/g, "")
        .toLowerCase();
      const currentAnswer = this.state.currentQuestion.answer
        .toLowerCase()
      return (answerValue === currentAnswer);
    }
  };

  renderCorrectAnswer() {
    return (
      <div className="quiz-play-container">
        <div className="quiz-play-question">
          {this.state.currentQuestion.question}
        </div>
        <div className={`${this.isCorrectAnswered() ? "correct-answer" : "wrong-answer"}`}>
          {this.isCorrectAnswered() ? "Corrected!" : "Incorrect! Please try again"}
        </div>
        <div className="quiz-answer">{this.state.currentQuestion.answer}</div>
        <div className="next-question btn" onClick={this.getNextQuestion}>
          {" "}
          Click to next button{" "}
        </div>
      </div>
    );
  }

  renderPlay() {
    return (this.state.previousQuestions.length === questionLimit || this.state.isGameEnded) ? (
      this.renderFinalScore()
    ) : this.state.isAnswer ? (
      this.renderCorrectAnswer()
    ) : (
      <div className="quiz-play-container">
        <div className="quiz-play-question">
          {this.state.currentQuestion.question}
        </div>
        <form onSubmit={this.submitGuess}>
          <input type="text" name="guess" onChange={this.onChangeEvent} />
          <input
            className="btn"
            type="submit"
            value="Submit Answer"
          />
        </form>
      </div>
    );
  }

  render() {
    return this.state.quizCate ? this.renderPlay() : this.renderPrePlay();
  }
}

export default QuizView;
