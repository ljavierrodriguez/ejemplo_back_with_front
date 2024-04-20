from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()


class Task(db.Model):
    __tablename__ = 'todos'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(150), nullable=False) # campo obligatorio (nullable=False)
    done = db.Column(db.Boolean, default=False)
    #status = db.Column(db.String(100), default="Normal") # Baja | Normal | Urgente

    def serialize(self):
        return {
            "id": self.id,
            "description": self.description,
            "done": self.done
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
