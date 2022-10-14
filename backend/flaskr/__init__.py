import os
from flask import Flask, request, abort, jsonify
from sqlalchemy import and_, func
from sqlalchemy.sql.operators import ColumnOperators
from flask_cors import CORS

from models import setup_db, Question, Category

QUESTIONS_PER_PAGE = 10


def paginate_questions(request, getQuestionbyID):
    page = request.args.get('page', 1, type=int)
    start = (page - 1) * QUESTIONS_PER_PAGE
    end = start + QUESTIONS_PER_PAGE
    questions = [question.format() for question in getQuestionbyID]
    currentQuestions = questions[start:end]
    return currentQuestions


def create_app(test_config=None):
    # App config
    app = Flask(__name__)
    setup_db(app)
    CORS(app, resources={r"*": {"origins": "*"}})

    # CORS Headers
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers',
                             'Content-Type,Authorization,true')
        response.headers.add('Access-Control-Allow-Methods',
                             'GET,PUT,POST,DELETE,OPTIONS')
        return response

    # GET requests for all categories if available
    @app.route('/categories')
    def get_categories():
        categories = Category.query.all()
        currentCates = [category.format() for category in categories]

        return jsonify({
            'success': True,
            'currentCates': currentCates,
            'totalCates': len(categories)
        }), 200

    # GET questions including pagination
    @app.route('/questions')
    def get_questions():
        questions = Question.query.order_by(Question.id).all()
        currentQuestions = paginate_questions(request, questions)

        categories = Category.query.all()
        cateType = []
        for category in categories:
            cateType.append({"id": category.id, "type": category.type})

        return jsonify({
            'success': True,
            'dataResult': {
                'questions': currentQuestions,
                'categories': cateType
            },
            'totalQuestions': len(questions),
            'category': 'All'
        }), 200

    # DELETE question using a question ID.
    @app.route('/question/<int:question_id>', methods=['DELETE'])
    def delete_question(question_id):
        try:
            question = Question.query.get(question_id)
            if question is None:
                return abort(400)

            # test a block of code for errors
            try:
                question.delete()
            except:
                return abort(400)

            return jsonify({
                'success': True,
                'deletedQuestion': question_id,
                'questions': paginate_questions(request, (Question.query.order_by(Question.id).all())),
            }), 200

        except Exception:
            abort(422)

    # POST a new question
    @app.route('/question', methods=['POST'])
    def add_question():
        body = request.get_json()
        searchTerm = body.get('searchTerm', None)
        try:
            if searchTerm:
                questions = Question.query.filter(
                    Question.question.ilike('%'+searchTerm+'%')).all()
                currentQuestions = [question.format()
                                    for question in questions]
                return jsonify({
                    'success': True,
                    'questions': currentQuestions,
                    'total': len(currentQuestions)
                }), 200
            else:
                question = Question(question=body['question'], answer=body['answer'],
                                    category=body['category'], difficulty=body['difficulty'])
                question.insert()
                return jsonify(
                    success=True,
                    created=question.format()["id"],
                    question=question.format()
                ), 200
        except:
            return abort(400)

    # GET question based on category
    @app.route('/category/<int:category_id>/questions')
    def get_question_from_category(category_id):
        questions = Question.query.join(Category, Question.category == Category.id).filter(
            Category.id == category_id).all()
        questionsFromCates = [question.format() for question in questions]

        return jsonify({
            'success': True,
            'questions': questionsFromCates,
            'total': len(questions),
            'category': category_id
        }), 200

    # POST get questions to play the quiz
    @app.route('/quiz/question', methods=['POST'])
    def quiz():
        body = request.get_json()
        if body['category'] == 0:
            question = Question.query.join(Category, Question.category == Category.id)\
                .filter(ColumnOperators.notin_(Question.id, body['previous_questions']))\
                .order_by(func.random())\
                .first()
        else:
            question = Question.query.join(Category, Question.category == Category.id)\
                .filter(and_(Category.id == body['category'], ColumnOperators.notin_(Question.id, body['previous_questions'])))\
                .order_by(func.random())\
                .first()

        if question is None:
            return abort(400)

        return jsonify({
            'success': True,
            'question': question.format()
        }), 200

    # Error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({
            'success': False,
            'error': 'Bad Request',
            "message": "Bad request"
        }), 400

    @app.errorhandler(404)
    def page_not_found(error):
        return jsonify({
            "success": False,
            'error': 404,
            "message": "Page not found"
        }), 404

    @app.errorhandler(405)
    def invalid_method(error):
        return jsonify({
            "success": False,
            'error': 405,
            "message": "Invalid method!"
        }), 405

    @app.errorhandler(422)
    def unprocessable_recource(error):
        return jsonify({
            "success": False,
            'error': 422,
            "message": "Unprocessable recource"
        }), 422

    return app

    # * Hi reviewer. I commented this method beacause I wanted to try combine add question method and search
    # * question method in only code block. Thanks
    # @app.route('/questions', methods=['POST'])
    # def search_questions():
    #     body = request.get_json()
    #     searchTerm = body.get('searchTerm', None)

    #     if searchTerm:
    #         questions = Question.query.filter( Question.question.ilike(f'%{search_term}%')).all()
    #         currentQuestions = [question.format() for question in questions]
    #     else:
    #         return abort(400)

    #     return jsonify({
    #         'success': True,
    #         'dataResult': currentQuestions,
    #         'total': len(currentQuestions)
    #     }), 200
