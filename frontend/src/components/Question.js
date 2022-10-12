import React, { Component } from "react";
import "../stylesheets/Question.css";

class Question extends Component {
  constructor() {
    super();
    this.state = {
      visibleAnswer: false,
    };
  }

  flipVisibility() {
    this.setState({ visibleAnswer: !this.state.visibleAnswer });
  }

  render() {
    const { question, answer, category, difficulty } = this.props;
    return (
      <div className="question-container">
        <div className="question">{question}</div>
        <div className="question-status">
          <img className="cate" src={`${category}.svg`} />
          <div className="difficulty">Difficulty: {difficulty}</div>
          <img src="delete.png" className="delete" onClick={() => this.props.questionAction("DELETE")} />
        </div>

        <div className="show-answer btn" onClick={() => this.flipVisibility()} >
          {this.state.visibleAnswer ? "Hide" : "Show"} Answer
        </div>
        <div className="answer">
          <span style={{ "visibility": this.state.visibleAnswer ? 'visible' : 'hidden' }}>Answer: {answer}</span>
        </div>
      </div>
    );
  }
}

export default Question;
