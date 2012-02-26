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
			// app.collections.posts.add(Prefetch.Posts);
			app.collections.posts.fetch();

			this.views = {}

			this.views.dropdown = new app.Views.Dropdown({
				collection: app.collections.posts,
				model: app.models.post
			});
			$('#dropdown-wrap').empty().append(this.views.dropdown.render().el);

		}
	});

	app.Models.Post = Backbone.Model.extend({
		defaults: {
			title: '',
			content: ''
		}
	});

	// app.models.post = new app.Models.Post();

	app.Collections.Posts = Backbone.Collection.extend({
		localStorage: new Store('posts'),
		model: app.Models.Post
	});

	app.collections.posts = new app.Collections.Posts();

	app.Views.Editor = Backbone.View.extend({
		events: {
			'keyup textarea, input': 'updateContent',
			'click button': 'dummyData',
			'click a.btn.save': 'save',
			'click a.btn.delete': 'delete',
			'click a.btn.bold': 'makeBold',
			'click a.btn.italic': 'makeItalic',
		},

		initialize: function() {
			var templateSrc;
			_.bindAll(this, 'render');
			this.model.bind('destroy', this.render);
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
				title: $('input').val(),
				content: $('textarea').val()
			});
			this.showMessage('changed');
		},

		dummyData: function() {
			$('textarea').val($('#dummy-data').html().trim()).trigger('keyup');
			$('input').val('Sample Title').trigger('keyup');
		},

		save: function(e) {
			e.preventDefault();
			this.model.save();
			this.showMessage('alert-success');
		},

		delete: function(e) {
			e.preventDefault();
			this.model.destroy();
		},

		makeBold: function(e) {
			e.preventDefault();
			var $textarea = $('textarea');
			wrapText($textarea.get(0), '**');
			$textarea.trigger('keyup');
		},

		makeItalic: function(e) {
			e.preventDefault();
			var $textarea = $('textarea');
			wrapText($textarea.get(0), '_');
			$textarea.trigger('keyup');
		},

		showMessage: function(type) {
			var messages = {
				'changed': 'Model is dirty.',
				'alert-success': 'Model saved.'
			};
			var $alert = this.$('.alert');
			if ( ! $alert.hasClass(type)) {
				console.log('a', $alert);
				$alert.removeClass().addClass('alert '+type);
				$alert.empty().append(messages[type]);
			}
		}
	});

	app.Views.Viewer = Backbone.View.extend({
		tagName: 'article',
		id: 'viewer',

		initialize: function() {
			var templateSrc;
			_.bindAll(this, 'render');
			this.model.bind('all', this.render);
			templateSrc = $('#viewer-template').html();
			this.template = Handlebars.compile(templateSrc);
		},

		render: function() {
			$(this.el).html(this.template(
				this.model.toJSON()
			));
			return this;
		}
	});

	app.Views.Dropdown = Backbone.View.extend({
		events: {
			'change select': 'editPost',
			'click button': 'newPost'
		},

		initialize: function() {
			var templateSrc;
			_.bindAll(this, 'render');
			this.collection.bind('all', this.render);
			templateSrc = $('#dropdown-template').html();
			this.template = Handlebars.compile(templateSrc);
		},

		render: function() {
			$(this.el).html(this.template({
				collection: this.collection.toJSON()
			}));
			return this;
		},

		editPost: function(e) {
			var id, views = {};
			id = $(':selected', e.currentTarget).val();
			if (id === 'new') return this.newPost();

			views.editor = new app.Views.Editor({
				collection: app.collections.posts,
				model: app.collections.posts.get(id)
			});
			$('#editor-wrap').empty().append(views.editor.render().el);

			views.viewer = new app.Views.Viewer({
				collection: app.collections.posts,
				model: app.collections.posts.get(id)
			});
			$('#viewer-wrap').empty().append(views.viewer.render().el);
		},

		newPost: function() {
			var post = new app.Models.Post()
			,	views = {}
			;
			app.collections.posts.add(post);
			views.editor = new app.Views.Editor({
				collection: app.collections.posts,
				model: post
			});
			$('#editor-wrap').empty().append(views.editor.render().el);

			views.viewer = new app.Views.Viewer({
				collection: app.collections.posts,
				model: post
			});
			$('#viewer-wrap').empty().append(views.viewer.render().el);
		}
	});

	app.router = new app.Router();
	Backbone.history.start({ pushState: true });

	function wrapText(textarea, wrap){
		var len = textarea.value.length;
		var start = textarea.selectionStart;
		var end = textarea.selectionEnd;
		var sel = textarea.value.substring(start, end);
		var replace = wrap + sel + wrap;
		textarea.value = textarea.value.substring(0,start) + replace +
		textarea.value.substring(end,len);
		textarea.selectionStart = start + wrap.length;
		textarea.selectionEnd = end + wrap.length;
	}

});

Handlebars.registerHelper('markdown', function() {
	return new Handlebars.SafeString( markdown.toHTML(this.content) );
});
