import { createMemberAction } from "../../../lib/actions";

export default function MemberNewPage() {
  return (
    <div className="content content-members">
      <h1>メンバー追加</h1>
      <form action={createMemberAction} className="form-card member-form">
        <div className="form-grid">
          <label>名前 *<input name="name" placeholder="氏名を入力" /></label>
          <label className="wide">クラス *<input name="class_name" placeholder="クラス名を入力" /></label>
          <label>メールアドレス<input name="email" placeholder="name@example.ac.jp" /></label>
          <label>学年<select name="grade"><option value="">選択してください</option><option value="1">1年生</option><option value="2">2年生</option><option value="3">3年生</option></select></label>
        </div>
        <div className="form-actions"><button type="button">キャンセル</button><button className="primary">登録する</button></div>
      </form>
    </div>
  );
}
