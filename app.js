/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.js                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: elhirond <elhirond@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/01 16:06:45 by elhirond          #+#    #+#             */
/*   Updated: 2026/02/01 16:06:45 by elhirond         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

function App() {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <h1>🚀 React propre</h1>
      <p>Compteur : {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Clique moi
      </button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App />)
