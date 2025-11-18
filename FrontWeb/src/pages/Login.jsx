function Login() {
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form className="space-y-3">
        <input type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input type="password" placeholder="Password" className="w-full border rounded px-3 py-2" />
        <button type="submit" className="w-full px-3 py-2 rounded bg-blue-600 text-white">Sign In</button>
      </form>
      <div className="mt-4 flex gap-2">
        <button className="px-3 py-2 rounded bg-red-500 text-white">Google</button>
        <button className="px-3 py-2 rounded bg-blue-700 text-white">Facebook</button>
      </div>
    </div>
  )
}

export default Login