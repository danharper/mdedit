$(function() {
	var app = window.app || {
		Router: {},
		Collections: {},
		Models: {},
		Views: {},
		router: {},
		collections: {},
		models: {},
		views: {}
	};
	window.app = app;

	app.Router = Backbone.Router.extend({
		routes: {
			'*path': 'home'
		},

		home: function() {
			this.views = {}

			this.views.editor = new app.Views.Editor({
				model: app.models.post
			});
			$('#editor-wrap').empty().append(this.views.editor.render().el);

			this.views.viewer = new app.Views.Viewer({
				model: app.models.post
			});
			$('#viewer-wrap').empty().append(this.views.viewer.render().el);
		}
	});

	app.Models.Post = Backbone.Model.extend({
		defaults: {
			content: ""
		}
	});

	app.models.post = new app.Models.Post();

	app.Views.Editor = Backbone.View.extend({
		events: {
			'keyup textarea': 'updateContent',
			'click button': 'dummyData',
		},

		initialize: function() {
			var templateSrc;
			_.bindAll(this, 'render');
			// this.model.bind('change', this.render);
			templateSrc = $('#editor-template').html();
			this.template = Handlebars.compile(templateSrc);
		},

		render: function() {
			$(this.el).html(this.template(
				this.model.toJSON()
			));
			return this;
		},

		updateContent: function() {
			this.model.set({
				content: markdown.toHTML($('textarea').val())
			});
		},

		dummyData: function() {
			this.model.set({
				content: $('#dummy-data').html()
			});
			$('textarea').val($('#dummy-data').html().trim()).trigger('keyup');
		}
	});

	app.Views.Viewer = Backbone.View.extend({
		id: 'viewer',

		initialize: function() {
			var templateSrc;
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
			templateSrc = $('#viewer-template').html();
			this.template = Handlebars.compile(templateSrc);
		},

		render: function() {
			$(this.el).html(this.template({
				content: this.model.get('content')
			}));
			return this;
		}
	});

	app.router = new app.Router();
	Backbone.history.start({ pushState: true });
});