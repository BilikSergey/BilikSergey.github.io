async function fetchArticle(text) {
    const apiKey = '781afd86b6bc4ccaadde529d54fe0d91';
    const query = encodeURIComponent(text);
    const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`);
    const data = await response.json();

    if (data.articles && data.articles.length > 0) {
        const article = data.articles[0]; // Найбільш релевантна стаття
        return article;
    } else {
        return null;
    }
}

