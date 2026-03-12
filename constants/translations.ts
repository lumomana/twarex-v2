export type TranslationKeys = 
  | 'app.name'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.version'
  | 'common.lastUpdated'
  | 'common.by'
  | 'common.confirm'
  | 'nav.timeline'
  | 'nav.search'
  | 'nav.stats'
  | 'nav.profile'
  | 'timeline.title'
  | 'timeline.tweet'
  | 'timeline.retweet'
  | 'timeline.reply'
  | 'timeline.likes'
  | 'timeline.retweets'
  | 'timeline.noTweets'
  | 'timeline.loadMore'
  | 'search.placeholder'
  | 'search.noResults'
  | 'search.filters'
  | 'search.dateRange'
  | 'search.clearFilters'
  | 'stats.title'
  | 'stats.postingTrends'
  | 'stats.engagement'
  | 'stats.activityHeatmap'
  | 'stats.timeDistribution'
  | 'stats.topWords'
  | 'stats.tweetsPerDay'
  | 'stats.tweetsPerMonth'
  | 'stats.tweetsPerYear'
  | 'stats.summary'
  | 'profile.title'
  | 'profile.archive'
  | 'profile.archiveSource'
  | 'profile.sampleData'
  | 'profile.imported'
  | 'profile.archiveSettings'
  | 'profile.importGuide'
  | 'profile.export'
  | 'profile.privacy'
  | 'profile.privacyMode'
  | 'profile.privacyModeDesc'
  | 'profile.blockNetwork'
  | 'profile.blockNetworkDesc'
  | 'profile.privacyPolicy'
  | 'profile.about'
  | 'profile.language'
  | 'profile.english'
  | 'profile.french'
  | 'profile.spanish'
  | 'profile.japanese'
  | 'profile.arabic'
  | 'archive.settings'
  | 'archive.import'
  | 'archive.reset'
  | 'archive.confirmReset'
  | 'archive.resetSuccess'
  | 'archive.importSuccess'
  | 'archive.importError'
  | 'privacy.title'
  | 'privacy.policy'
  | 'export.title'
  | 'export.format'
  | 'export.pdf'
  | 'export.json'
  | 'export.csv'
  | 'export.dateRange'
  | 'export.all'
  | 'export.selected'
  | 'export.generating'
  | 'export.success'
  | 'export.error'
  | 'import.guide'
  | 'import.step1'
  | 'import.step1Desc'
  | 'import.step2'
  | 'import.step2Desc'
  | 'import.step3'
  | 'import.step3Desc'
  | 'import.help';

export type TranslationDictionary = Record<TranslationKeys, string>;

export type Translations = {
  en: TranslationDictionary;
  fr: TranslationDictionary;
  es: TranslationDictionary;
  ja: TranslationDictionary;
  ar: TranslationDictionary;
};

export const translations: Translations = {
  en: {
    // Common
    'app.name': 'Twitter Archive Explorer',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.version': 'Version : 1.1',
    'common.lastUpdated': 'Last Updated: March 2026',
    'common.by': 'By',
    'common.confirm': 'Confirm',
    
    // Navigation
    'nav.timeline': 'Timeline',
    'nav.search': 'Search',
    'nav.stats': 'Statistics',
    'nav.profile': 'Archive',
    
    // Timeline
    'timeline.title': 'Timeline',
    'timeline.tweet': 'Tweet',
    'timeline.retweet': 'Retweet',
    'timeline.reply': 'Reply',
    'timeline.likes': 'Likes',
    'timeline.retweets': 'Retweets',
    'timeline.noTweets': 'No tweets found for this period',
    'timeline.loadMore': 'Load more',
    
    // Search
    'search.placeholder': 'Search your tweets...',
    'search.noResults': 'No results found',
    'search.filters': 'Filters',
    'search.dateRange': 'Date Range',
    'search.clearFilters': 'Clear all filters',
    
    // Stats
    'stats.title': 'Analytics',
    'stats.postingTrends': 'Posting Trends',
    'stats.engagement': 'Engagement Analysis',
    'stats.activityHeatmap': 'Activity Heatmap',
    'stats.timeDistribution': 'Time Distribution',
    'stats.topWords': 'Most Used Keywords',
    'stats.tweetsPerDay': 'Daily Average',
    'stats.tweetsPerMonth': 'Monthly Breakdown',
    'stats.tweetsPerYear': 'Yearly Evolution',
    'stats.summary': 'Activity Summary',
    
    // Profile / Archive
    'profile.title': 'Archive Management',
    'profile.archive': 'Archive',
    'profile.archiveSource': 'Data Source',
    'profile.sampleData': 'Demo Mode (Sample Data)',
    'profile.imported': 'Personal Archive Loaded',
    'profile.archiveSettings': 'Data Management',
    'profile.importGuide': 'How to get my archive?',
    'profile.export': 'Generate PDF Report',
    'profile.privacy': 'Privacy & Security',
    'profile.privacyMode': 'Enhanced Privacy',
    'profile.privacyModeDesc': 'Anonymize sensitive data in views',
    'profile.blockNetwork': 'Offline-First Mode',
    'profile.blockNetworkDesc': 'Ensures no data leaves your device',
    'profile.privacyPolicy': 'Privacy Policy',
    'profile.about': 'About this app',
    'profile.language': 'Language / Langue',
    'profile.english': 'English',
    'profile.french': 'Français',
    'profile.spanish': 'Español',
    'profile.japanese': '日本語',
    'profile.arabic': 'العربية',
    
    // Archive Settings
    'archive.settings': 'Archive Configuration',
    'archive.import': 'Import ZIP Archive',
    'archive.reset': 'Switch back to Demo Mode',
    'archive.confirmReset': 'This will remove your imported data from the app. Continue?',
    'archive.resetSuccess': 'App reset to demo mode',
    'archive.importSuccess': 'Archive successfully imported!',
    'archive.importError': 'Failed to read archive. Please check the file format.',
    
    // Privacy
    'privacy.title': 'Your Data Privacy',
    'privacy.policy': 'All processing is done locally on your device. Your tweets never leave this app.',
    
    // Export
    'export.title': 'Export to PDF',
    'export.format': 'Document Format',
    'export.pdf': 'Professional PDF Report',
    'export.json': 'Raw JSON Data',
    'export.csv': 'Spreadsheet (CSV)',
    'export.dateRange': 'Export Period',
    'export.all': 'Full History',
    'export.selected': 'Custom Range',
    'export.generating': 'Creating your PDF...',
    'export.success': 'Export completed successfully',
    'export.error': 'An error occurred during generation',
    
    // Import Guide
    'import.guide': 'Archive Retrieval Guide',
    'import.step1': '1. Request Data',
    'import.step1Desc': 'Go to Twitter Settings > Your Account > Download an archive of your data.',
    'import.step2': '2. Wait for Email',
    'import.step2Desc': 'Twitter will notify you when the ZIP is ready (usually 24-48h).',
    'import.step3': '3. Upload Here',
    'import.step3Desc': 'Download the ZIP and upload it in the Archive tab of this app.',
    'import.help': 'Need technical assistance?',
  },
  
  fr: {
    // Common
    'app.name': 'Explorateur d\'Archive Twitter',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.version': 'Version : 1.1',
    'common.lastUpdated': 'Dernière mise à jour : Mars 2026',
    'common.by': 'Par',
    'common.confirm': 'Confirmer',
    
    // Navigation
    'nav.timeline': 'Chronologie',
    'nav.search': 'Recherche',
    'nav.stats': 'Analyses',
    'nav.profile': 'Archive',
    
    // Timeline
    'timeline.title': 'Historique des Tweets',
    'timeline.tweet': 'Tweet',
    'timeline.retweet': 'Retweet',
    'timeline.reply': 'Réponse',
    'timeline.likes': 'J\'aime',
    'timeline.retweets': 'Retweets',
    'timeline.noTweets': 'Aucun tweet trouvé pour cette période',
    'timeline.loadMore': 'Charger plus',
    
    // Search
    'search.placeholder': 'Rechercher dans vos tweets...',
    'search.noResults': 'Aucun résultat trouvé',
    'search.filters': 'Filtres',
    'search.dateRange': 'Période',
    'search.clearFilters': 'Effacer les filtres',
    
    // Stats
    'stats.title': 'Statistiques & Analyses',
    'stats.postingTrends': 'Tendances de publication',
    'stats.engagement': 'Analyse de l\'engagement',
    'stats.activityHeatmap': 'Intensité de l\'activité',
    'stats.timeDistribution': 'Répartition horaire',
    'stats.topWords': 'Mots-clés récurrents',
    'stats.tweetsPerDay': 'Moyenne quotidienne',
    'stats.tweetsPerMonth': 'Répartition mensuelle',
    'stats.tweetsPerYear': 'Évolution annuelle',
    'stats.summary': 'Résumé de l\'activité',
    
    // Profile / Archive
    'profile.title': 'Gestion de l\'Archive',
    'profile.archive': 'Archive',
    'profile.archiveSource': 'Source des données',
    'profile.sampleData': 'Mode Démo (Données fictives)',
    'profile.imported': 'Archive personnelle chargée',
    'profile.archiveSettings': 'Gestion des données',
    'profile.importGuide': 'Comment obtenir mon archive ?',
    'profile.export': 'Générer un rapport PDF',
    'profile.privacy': 'Sécurité & Confidentialité',
    'profile.privacyMode': 'Confidentialité renforcée',
    'profile.privacyModeDesc': 'Anonymiser les données sensibles à l\'écran',
    'profile.blockNetwork': 'Mode Hors-ligne strict',
    'profile.blockNetworkDesc': 'Garantit qu\'aucune donnée ne quitte l\'appareil',
    'profile.privacyPolicy': 'Politique de confidentialité',
    'profile.about': 'À propos de l\'application',
    'profile.language': 'Langue / Language',
    'profile.english': 'English',
    'profile.french': 'Français',
    'profile.spanish': 'Español',
    'profile.japanese': '日本語',
    'profile.arabic': 'العربية',
    
    // Archive Settings
    'archive.settings': 'Configuration de l\'archive',
    'archive.import': 'Importer une archive ZIP',
    'archive.reset': 'Revenir au mode démo',
    'archive.confirmReset': 'Cela supprimera vos données importées de l\'application. Continuer ?',
    'archive.resetSuccess': 'Retour au mode démo effectué',
    'archive.importSuccess': 'Archive importée avec succès !',
    'archive.importError': 'Erreur de lecture. Vérifiez le format du fichier ZIP.',
    
    // Privacy
    'privacy.title': 'Vos données sont privées',
    'privacy.policy': 'Tout le traitement est effectué localement. Vos tweets ne quittent jamais cette application.',
    
    // Export
    'export.title': 'Exportation PDF',
    'export.format': 'Format du document',
    'export.pdf': 'Rapport PDF professionnel',
    'export.json': 'Données brutes JSON',
    'export.csv': 'Tableur (CSV)',
    'export.dateRange': 'Période d\'exportation',
    'export.all': 'Tout l\'historique',
    'export.selected': 'Période personnalisée',
    'export.generating': 'Création de votre PDF...',
    'export.success': 'Exportation terminée avec succès',
    'export.error': 'Une erreur est survenue lors de la génération',
    
    // Import Guide
    'import.guide': 'Guide de récupération d\'archive',
    'import.step1': '1. Demander les données',
    'import.step1Desc': 'Allez dans Paramètres Twitter > Votre compte > Télécharger une archive de vos données.',
    'import.step2': '2. Attendre l\'email',
    'import.step2Desc': 'Twitter vous préviendra quand le ZIP sera prêt (généralement 24-48h).',
    'import.step3': '3. Charger ici',
    'import.step3Desc': 'Téléchargez le ZIP et importez-le dans l\'onglet Archive de cette application.',
    'import.help': 'Besoin d\'assistance technique ?',
  },
  
  es: {
    // Keep existing or minimal updates for ES/JA/AR as I focus on FR/EN per user request
    'app.name': 'Explorador de Archivo Twitter',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.version': 'Versión',
    'common.lastUpdated': 'Última actualización',
    'common.by': 'Por',
    'common.confirm': 'Confirmar',
    'nav.timeline': 'Cronología',
    'nav.search': 'Búsqueda',
    'nav.stats': 'Estadísticas',
    'nav.profile': 'Archivo',
    'timeline.title': 'Archivo de Twitter',
    'timeline.tweet': 'Tweet',
    'timeline.retweet': 'Retweet',
    'timeline.reply': 'Respuesta',
    'timeline.likes': 'Me gusta',
    'timeline.retweets': 'Retweets',
    'timeline.noTweets': 'No se encontraron tweets',
    'timeline.loadMore': 'Cargar más',
    'search.placeholder': 'Buscar tweets...',
    'search.noResults': 'No se encontraron resultados',
    'search.filters': 'Filtros',
    'search.dateRange': 'Rango de fechas',
    'search.clearFilters': 'Borrar filtros',
    'stats.title': 'Estadísticas',
    'stats.postingTrends': 'Tendencias',
    'stats.engagement': 'Compromiso',
    'stats.activityHeatmap': 'Mapa de calor',
    'stats.timeDistribution': 'Distribución horaria',
    'stats.topWords': 'Palabras frecuentes',
    'stats.tweetsPerDay': 'Tweets por día',
    'stats.tweetsPerMonth': 'Tweets por mes',
    'stats.tweetsPerYear': 'Tweets por año',
    'stats.summary': 'Resumen',
    'profile.title': 'Archivo',
    'profile.archive': 'Archivo',
    'profile.archiveSource': 'Fuente',
    'profile.sampleData': 'Datos de muestra',
    'profile.imported': 'Importado',
    'profile.archiveSettings': 'Ajustes',
    'profile.importGuide': 'Guía',
    'profile.export': 'Exportar',
    'profile.privacy': 'Privacidad',
    'profile.privacyMode': 'Modo privado',
    'profile.privacyModeDesc': 'Proteger datos',
    'profile.blockNetwork': 'Bloquear red',
    'profile.blockNetworkDesc': 'Sin conexión',
    'profile.privacyPolicy': 'Privacidad',
    'profile.about': 'Acerca de',
    'profile.language': 'Idioma',
    'profile.english': 'English',
    'profile.french': 'Français',
    'profile.spanish': 'Español',
    'profile.japanese': '日本語',
    'profile.arabic': 'العربية',
    'archive.settings': 'Ajustes',
    'archive.import': 'Importar',
    'archive.reset': 'Reiniciar',
    'archive.confirmReset': '¿Estás seguro?',
    'archive.resetSuccess': 'Reiniciado',
    'archive.importSuccess': 'Importado',
    'archive.importError': 'Error',
    'privacy.title': 'Privacidad',
    'privacy.policy': 'Local solamente',
    'export.title': 'Exportar',
    'export.format': 'Formato',
    'export.pdf': 'PDF',
    'export.json': 'JSON',
    'export.csv': 'CSV',
    'export.dateRange': 'Rango',
    'export.all': 'Todo',
    'export.selected': 'Seleccionado',
    'export.generating': 'Generando...',
    'export.success': 'Éxito',
    'export.error': 'Error',
    'import.guide': 'Guía',
    'import.step1': 'Paso 1',
    'import.step1Desc': 'Solicitar datos',
    'import.step2': 'Paso 2',
    'import.step2Desc': 'Esperar email',
    'import.step3': 'Paso 3',
    'import.step3Desc': 'Cargar aquí',
    'import.help': 'Ayuda',
  },
  
  ja: {
    // Simplified for now
    'app.name': 'Twitterアーカイブエクスプローラー',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.version': 'バージョン',
    'common.lastUpdated': '最終更新',
    'common.by': '作成者',
    'common.confirm': '確認',
    'nav.timeline': 'タイムライン',
    'nav.search': '検索',
    'nav.stats': '統計',
    'nav.profile': 'アーカイブ',
    'timeline.title': 'アーカイブ',
    'timeline.tweet': 'ツイート',
    'timeline.retweet': 'リツイート',
    'timeline.reply': '返信',
    'timeline.likes': 'いいね',
    'timeline.retweets': 'リツイート',
    'timeline.noTweets': '見つかりませんでした',
    'timeline.loadMore': 'もっと読み込む',
    'search.placeholder': '検索...',
    'search.noResults': '結果なし',
    'search.filters': 'フィルタ',
    'search.dateRange': '期間',
    'search.clearFilters': 'クリア',
    'stats.title': '統計',
    'stats.postingTrends': 'トレンド',
    'stats.engagement': 'エンゲージメント',
    'stats.activityHeatmap': 'ヒートマップ',
    'stats.timeDistribution': '時間分布',
    'stats.topWords': '頻出単語',
    'stats.tweetsPerDay': '日別',
    'stats.tweetsPerMonth': '月別',
    'stats.tweetsPerYear': '年別',
    'stats.summary': '概要',
    'profile.title': 'アーカイブ',
    'profile.archive': 'アーカイブ',
    'profile.archiveSource': 'ソース',
    'profile.sampleData': 'サンプル',
    'profile.imported': 'インポート済み',
    'profile.archiveSettings': '設定',
    'profile.importGuide': 'ガイド',
    'profile.export': 'エクスポート',
    'profile.privacy': 'プライバシー',
    'profile.privacyMode': 'プライバシーモード',
    'profile.privacyModeDesc': 'データを保護',
    'profile.blockNetwork': 'オフライン',
    'profile.blockNetworkDesc': '通信を遮断',
    'profile.privacyPolicy': 'ポリシー',
    'profile.about': '情報',
    'profile.language': '言語',
    'profile.english': 'English',
    'profile.french': 'Français',
    'profile.spanish': 'Español',
    'profile.japanese': '日本語',
    'profile.arabic': 'العربية',
    'archive.settings': '設定',
    'archive.import': 'インポート',
    'archive.reset': 'リセット',
    'archive.confirmReset': 'よろしいですか？',
    'archive.resetSuccess': 'リセット完了',
    'archive.importSuccess': '完了',
    'archive.importError': 'エラー',
    'privacy.title': 'プライバシー',
    'privacy.policy': 'ローカル処理',
    'export.title': 'エクスポート',
    'export.format': '形式',
    'export.pdf': 'PDF',
    'export.json': 'JSON',
    'export.csv': 'CSV',
    'export.dateRange': '期間',
    'export.all': 'すべて',
    'export.selected': '選択範囲',
    'export.generating': '生成中...',
    'export.success': '成功',
    'export.error': 'エラー',
    'import.guide': 'ガイド',
    'import.step1': 'ステップ1',
    'import.step1Desc': 'リクエスト',
    'import.step2': 'ステップ2',
    'import.step2Desc': 'メールを待つ',
    'import.step3': 'ステップ3',
    'import.step3Desc': 'アップロード',
    'import.help': 'ヘルプ',
  },
  
  ar: {
    // Simplified for now
    'app.name': 'مستكشف أرشيف تويتر',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'common.version': 'الإصدار',
    'common.lastUpdated': 'آخر تحديث',
    'common.by': 'بواسطة',
    'common.confirm': 'تأكيد',
    'nav.timeline': 'الجدول الزمني',
    'nav.search': 'بحث',
    'nav.stats': 'الإحصائيات',
    'nav.profile': 'الأرشيف',
    'timeline.title': 'الأرشيف',
    'timeline.tweet': 'تغريدة',
    'timeline.retweet': 'إعادة تغريد',
    'timeline.reply': 'رد',
    'timeline.likes': 'إعجابات',
    'timeline.retweets': 'إعادات تغريد',
    'timeline.noTweets': 'لا توجد تغريدات',
    'timeline.loadMore': 'تحميل المزيد',
    'search.placeholder': 'بحث...',
    'search.noResults': 'لا توجد نتائج',
    'search.filters': 'تصفية',
    'search.dateRange': 'النطاق الزمني',
    'search.clearFilters': 'مسح الكل',
    'stats.title': 'الإحصائيات',
    'stats.postingTrends': 'اتجاهات النشر',
    'stats.engagement': 'التفاعل',
    'stats.activityHeatmap': 'خريطة النشاط',
    'stats.timeDistribution': 'التوزيع الزمني',
    'stats.topWords': 'الكلمات الأكثر استخداماً',
    'stats.tweetsPerDay': 'يومي',
    'stats.tweetsPerMonth': 'شهري',
    'stats.tweetsPerYear': 'سنوي',
    'stats.summary': 'ملخص',
    'profile.title': 'الأرشيف',
    'profile.archive': 'الأرشيف',
    'profile.archiveSource': 'المصدر',
    'profile.sampleData': 'بيانات تجريبية',
    'profile.imported': 'تم الاستيراد',
    'profile.archiveSettings': 'الإعدادات',
    'profile.importGuide': 'دليل الاستيراد',
    'profile.export': 'تصدير',
    'profile.privacy': 'الخصوصية',
    'profile.privacyMode': 'وضع الخصوصية',
    'profile.privacyModeDesc': 'حماية البيانات',
    'profile.blockNetwork': 'وضع عدم الاتصال',
    'profile.blockNetworkDesc': 'منع الاتصال بالشبكة',
    'profile.privacyPolicy': 'سياسة الخصوصية',
    'profile.about': 'حول التطبيق',
    'profile.language': 'اللغة',
    'profile.english': 'English',
    'profile.french': 'Français',
    'profile.spanish': 'Español',
    'profile.japanese': '日本語',
    'profile.arabic': 'العربية',
    'archive.settings': 'الإعدادات',
    'archive.import': 'استيراد',
    'archive.reset': 'إعادة ضبط',
    'archive.confirmReset': 'هل أنت متأكد؟',
    'archive.resetSuccess': 'تمت إعادة الضبط',
    'archive.importSuccess': 'تم الاستيراد بنجاح',
    'archive.importError': 'خطأ في الاستيراد',
    'privacy.title': 'الخصوصية',
    'privacy.policy': 'معالجة محلية',
    'export.title': 'تصدير',
    'export.format': 'الصيغة',
    'export.pdf': 'PDF',
    'export.json': 'JSON',
    'export.csv': 'CSV',
    'export.dateRange': 'النطاق الزمني',
    'export.all': 'الكل',
    'export.selected': 'المحدد',
    'export.generating': 'جاري التوليد...',
    'export.success': 'تم بنجاح',
    'export.error': 'خطأ',
    'import.guide': 'دليل الاستيراد',
    'import.step1': 'الخطوة 1',
    'import.step1Desc': 'طلب البيانات',
    'import.step2': 'الخطوة 2',
    'import.step2Desc': 'انتظار البريد',
    'import.step3': 'الخطوة 3',
    'import.step3Desc': 'الرفع هنا',
    'import.help': 'مساعدة؟',
  },
};
