function TotalCarbs({food, foods, portion}) {
    const totalCarbs = ((foods[food].value/100)*portion).toFixed(1);

    return (
        <div className="notification is-success has-text-light has-text-centered">
            <div className="title is-1">{totalCarbs}g</div>
            <div className="title is-4">Carbohydrates per {portion}g</div>
        </div>
    )
}

export default TotalCarbs;