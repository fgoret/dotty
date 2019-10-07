package dotty.tools.dotc.semanticdb

case class TextDocuments(documents: Seq[TextDocument]) extends SemanticdbMessage {
  private[this] var __serializedSizeCachedValue: _root_.scala.Int = 0
  private[this] def __computeSerializedValue(): _root_.scala.Int = {
    var __size = 0
    documents.foreach { __item =>
      val __value = __item
      __size += 1 +
        SemanticdbOutputStream.computeUInt32SizeNoTag(__value.serializedSize) +
        __value.serializedSize
    }
    __size
  }
  final override def serializedSize: _root_.scala.Int = {
    var read = __serializedSizeCachedValue
    if (read == 0) {
      read = __computeSerializedValue()
      __serializedSizeCachedValue = read
    }
    read
  }
  def writeTo(`_output__`: SemanticdbOutputStream): _root_.scala.Unit = {
    documents.foreach { __v =>
      val __m = __v
      _output__.writeTag(1, 2)
      _output__.writeUInt32NoTag(__m.serializedSize)
      __m.writeTo(_output__)
    };
  }
}
