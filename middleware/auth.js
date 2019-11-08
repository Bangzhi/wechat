export default function({store, redirect,error}) {

  if (!store.state.userInfo) {
    return redirect('/admin/login')
  }
}